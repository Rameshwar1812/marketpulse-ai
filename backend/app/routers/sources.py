import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Source, Category, Product, Brand, Claim, Ingredient, ProductIngredient, Evidence
from app.schemas import SourceResponse, CSVValidationResponse

from app.services.gemini_service import ocr_extract_packaging_label

router = APIRouter(prefix="/api/sources", tags=["Data Sources"])

@router.get("", response_model=list[SourceResponse])
def get_sources(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Source).all()

@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only packaging image uploads are supported.")
        
    content = await file.read()
    try:
        extraction = ocr_extract_packaging_label(content, file.content_type, file.filename)
        return extraction
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

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

@router.post("/import-records")
async def import_records(
    payload: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    filename = payload.get("filename", "Imported Catalog")
    records = payload.get("records", [])
    
    # Query or create a permanent audit log record for this specific file upload
    source = db.query(Source).filter(Source.name == filename).first()
    if not source:
        source = Source(
            name=filename,
            source_type="Manual Upload",
            reference=f"Ingested by {current_user.full_name}",
            collection_method="CSV Ingestion",
            status="Active",
            data_quality_score=0.95
        )
        db.add(source)
        db.flush()
        
    # In-memory caches to avoid expensive nested SELECT queries in the loop
    existing_categories = {c.name.lower(): c for c in db.query(Category).all()}
    existing_brands = {b.name.lower(): b for b in db.query(Brand).all()}
    existing_ingredients = {i.name.lower(): i for i in db.query(Ingredient).all()}
    existing_skus = {p.sku for p in db.query(Product.sku).all()}

    claims_to_add = []
    product_ingredients_to_add = []
    evidence_to_add = []

    for r in records:
        sku_val = r.get("sku", "").strip()
        if not sku_val or sku_val in existing_skus:
            continue
            
        cat_name = r.get("category", "Immunity").strip()
        cat_key = cat_name.lower()
        if cat_key not in existing_categories:
            new_cat = Category(name=cat_name, description=f"Imported category for {cat_name}.")
            db.add(new_cat)
            db.flush()
            existing_categories[cat_key] = new_cat
        category = existing_categories[cat_key]
        
        brand_name = r.get("brand", "Generic Ingestion").strip()
        brand_key = brand_name.lower()
        if brand_key not in existing_brands:
            new_brand = Brand(name=brand_name, market_segment="Imported")
            db.add(new_brand)
            db.flush()
            existing_brands[brand_key] = new_brand
        brand = existing_brands[brand_key]
        
        p = Product(
            name=r.get("name", "").strip(),
            sku=sku_val,
            brand_id=brand.id,
            category_id=category.id,
            description=f"Dietary supplement imported via CSV. Brand: {brand.name}.",
            illustrative_revenue=float(r.get("illustrative_revenue", 0.0)),
            momentum_score=float(r.get("momentum_score", 0.0)),
            ai_confidence=0.95,
            review_status="approved",
            source_id=source.id
        )
        db.add(p)
        db.flush()
        existing_skus.add(sku_val)
        
        claims_list = r.get("claims", [])
        if isinstance(claims_list, str):
            claims_list = [c.strip() for c in claims_list.split(";") if c.strip()]
        for claim_text in claims_list:
            c = Claim(
                product_id=p.id,
                raw_text=f"Label claim: {claim_text}",
                normalized_claim=claim_text,
                category_id=category.id,
                confidence=0.95,
                weight=1.0 / len(claims_list) if claims_list else 1.0
            )
            claims_to_add.append(c)
            
        ings_list = r.get("ingredients", [])
        if isinstance(ings_list, str):
            ings_list = [i.strip() for i in ings_list.split(";") if i.strip()]
        for ing_name in ings_list:
            ing_key = ing_name.lower()
            if ing_key not in existing_ingredients:
                new_ing = Ingredient(name=ing_name, description=f"Active compound: {ing_name}.")
                db.add(new_ing)
                db.flush()
                existing_ingredients[ing_key] = new_ing
            ing = existing_ingredients[ing_key]
            
            pi = ProductIngredient(
                product_id=p.id,
                ingredient_id=ing.id,
                dosage="Standard",
                is_hero=True,
                confidence=0.95
            )
            product_ingredients_to_add.append(pi)
            
        ev = Evidence(
            product_id=p.id,
            evidence_type="Label",
            description=f"Evidence matching for brand {brand.name}.",
            source_id=source.id,
            confidence=0.95
        )
        evidence_to_add.append(ev)
        
    if claims_to_add:
        db.add_all(claims_to_add)
    if product_ingredients_to_add:
        db.add_all(product_ingredients_to_add)
    if evidence_to_add:
        db.add_all(evidence_to_add)
        
    db.commit()
    return {"status": "success", "imported_count": len(records)}
