import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Source, Category
from app.schemas import SourceResponse, CSVValidationResponse

router = APIRouter(prefix="/api/sources", tags=["Data Sources"])

@router.get("", response_model=list[SourceResponse])
def get_sources(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Source).all()

@router.post("/upload-csv", response_model=CSVValidationResponse)
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Security requirement: CSV file type validation
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are supported.")

    # Read content
    content = await file.read()
    
    # Security requirement: CSV size validation (limit to 2MB for prototype)
    MAX_SIZE = 2 * 1024 * 1024 # 2MB
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 2MB.")

    # Parse CSV using standard python csv module (no pandas)
    try:
        decoded_content = content.decode("utf-8")
    except UnicodeDecodeError:
        try:
            decoded_content = content.decode("latin-1")
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to decode file. Please upload a UTF-8 encoded CSV.")

    f = io.StringIO(decoded_content)
    reader = csv.reader(f)
    
    # Retrieve header
    try:
        header = next(reader)
    except StopIteration:
        raise HTTPException(status_code=400, detail="CSV file is empty.")

    # Clean headers (strip spaces & convert to lowercase)
    headers = [h.strip().lower() for h in header]

    # Required fields mapping
    required_cols = {"name", "brand", "sku", "category", "revenue", "momentum"}
    missing_cols = required_cols - set(headers)
    
    # Check if we can proceed with matching similar columns
    # e.g. mapping "product_name" or "product" to "name"
    col_mapping = {}
    for standard_col in required_cols:
        for idx, h in enumerate(headers):
            if h == standard_col or (standard_col == "name" and h in ["product", "product_name", "title"]):
                col_mapping[standard_col] = idx
                break
            if h == standard_col or (standard_col == "revenue" and h in ["illustrative_revenue", "sales", "revenue_usd"]):
                col_mapping[standard_col] = idx
                break

    # If critical fields missing
    critical_missing = {"name", "sku", "category"} - col_mapping.keys()
    if critical_missing:
        raise HTTPException(
            status_code=400, 
            detail=f"CSV is missing critical columns: {list(critical_missing)}. Found columns: {header}"
        )

    # Fill mapping for optional fields
    for col in required_cols:
        if col not in col_mapping:
            # check if it exists exactly
            if col in headers:
                col_mapping[col] = headers.index(col)

    # Let's map claims and ingredients too if present
    claims_idx = None
    ingredients_idx = None
    for idx, h in enumerate(headers):
        if h in ["claims", "claim", "claims_list"]:
            claims_idx = idx
        elif h in ["ingredients", "ingredient", "ingredients_list"]:
            ingredients_idx = idx

    # Pre-fetch existing categories for verification
    db_categories = {c.name.lower(): c.name for c in db.query(Category).all()}

    rows_found = 0
    valid_rows = 0
    invalid_rows = 0
    warnings = []
    valid_records = []

    for r_idx, row in enumerate(reader, start=2):
        if not row:
            continue
        
        rows_found += 1
        
        # Check that row has enough elements
        if len(row) < len(col_mapping):
            invalid_rows += 1
            warnings.append(f"Row {r_idx}: Insufficient column values. Skipping.")
            continue

        # Extract data fields safely
        try:
            name_val = row[col_mapping["name"]].strip()
            sku_val = row[col_mapping["sku"]].strip()
            cat_val = row[col_mapping["category"]].strip()
            
            # Check empties
            if not name_val or not sku_val or not cat_val:
                invalid_rows += 1
                warnings.append(f"Row {r_idx}: Empty values in name, SKU, or category. Skipping.")
                continue

            # Revenue parsing
            rev_raw = row[col_mapping["revenue"]].strip() if "revenue" in col_mapping else "0"
            # Strip dollar signs and commas
            rev_raw = rev_raw.replace("$", "").replace(",", "")
            rev_val = float(rev_raw) if rev_raw else 0.0

            # Momentum parsing
            mom_raw = row[col_mapping["momentum"]].strip() if "momentum" in col_mapping else "0"
            mom_val = float(mom_raw) if mom_raw else 0.0
            
            if not (0.0 <= mom_val <= 10.0):
                warnings.append(f"Row {r_idx}: Momentum score '{mom_val}' out of range (0-10). Capping value.")
                mom_val = max(0.0, min(10.0, mom_val))

            brand_val = row[col_mapping["brand"]].strip() if "brand" in col_mapping else "Generic Ingestion"

            # Claims and ingredients list splitting
            claims = []
            if claims_idx is not None and claims_idx < len(row):
                claims_raw = row[claims_idx].strip()
                if claims_raw:
                    # Split by semicolon or comma if semicolon not found
                    sep = ";" if ";" in claims_raw else ","
                    claims = [c.strip() for c in claims_raw.split(sep) if c.strip()]

            ingredients = []
            if ingredients_idx is not None and ingredients_idx < len(row):
                ingredients_raw = row[ingredients_idx].strip()
                if ingredients_raw:
                    sep = ";" if ";" in ingredients_raw else ","
                    ingredients = [i.strip() for i in ingredients_raw.split(sep) if i.strip()]

            # Validate Category matching
            if cat_val.lower() not in db_categories:
                warnings.append(
                    f"Row {r_idx}: Category '{cat_val}' is not in the system's category list. "
                    f"AI classification mapper will assign this product dynamically upon import."
                )

            valid_records.append({
                "name": name_val,
                "sku": sku_val,
                "brand": brand_val,
                "category": cat_val,
                "illustrative_revenue": rev_val,
                "momentum_score": mom_val,
                "claims": claims,
                "ingredients": ingredients
            })
            valid_rows += 1

        except ValueError as e:
            invalid_rows += 1
            warnings.append(f"Row {r_idx}: Failed to parse numeric fields (revenue or momentum). Details: {str(e)}. Skipping.")
        except Exception as e:
            invalid_rows += 1
            warnings.append(f"Row {r_idx}: Unexpected parsing error: {str(e)}. Skipping.")

    # Do not write automatically into DB. Let the user review and confirm.
    return {
        "filename": file.filename,
        "rows_found": rows_found,
        "valid_rows": valid_rows,
        "invalid_rows": invalid_rows,
        "warnings": warnings,
        "valid_records": valid_records
    }
