import os
import csv
import collections
import random

def convert():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dsld_dir = os.path.join(base_dir, "DSLD-full-database-CSV")
    
    overview_path = os.path.join(dsld_dir, "ProductOverview_1.csv")
    facts_path = os.path.join(dsld_dir, "DietarySupplementFacts_1.csv")
    statements_path = os.path.join(dsld_dir, "LabelStatements_1.csv")
    output_path = os.path.join(base_dir, "dsld_market_catalog.csv")
    
    if not (os.path.exists(overview_path) and os.path.exists(facts_path) and os.path.exists(statements_path)):
        print("Error: Could not find all required DSLD CSV files in DSLD-full-database-CSV/ directory.")
        return

    print("Step 1: Reading Dietary Supplement Facts (Ingredients)...")
    ingredients_map = collections.defaultdict(list)
    with open(facts_path, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.reader(f)
        header = next(reader)
        # Find column indices
        id_idx = header.index("DSLD ID")
        ing_idx = header.index("Ingredient")
        
        # Read lines and map ingredients to DSLD ID
        for row in reader:
            if len(row) > max(id_idx, ing_idx):
                dsld_id = row[id_idx].strip()
                ing = row[ing_idx].strip()
                if ing and ing not in ingredients_map[dsld_id]:
                    ingredients_map[dsld_id].append(ing)

    print("Step 2: Reading Label Statements (Claims)...")
    claims_map = collections.defaultdict(list)
    with open(statements_path, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.reader(f)
        header = next(reader)
        id_idx = header.index("DSLD ID")
        type_idx = header.index("Statement Type")
        statement_idx = header.index("Statement")
        
        for row in reader:
            if len(row) > max(id_idx, type_idx, statement_idx):
                dsld_id = row[id_idx].strip()
                s_type = row[type_idx].strip()
                statement = row[statement_idx].strip()
                # Gather statements from 'Other' type (contains marketing claims)
                if s_type == "Other" and statement:
                    # Clean up trailing stars and punctuation
                    clean_statement = statement.replace("*", "").strip()
                    if clean_statement and clean_statement not in claims_map[dsld_id]:
                        claims_map[dsld_id].append(clean_statement)

    print("Step 3: Joining data and matching categories...")
    # Standard Categories mapping list
    categories = [
        "Sleep & Relaxation",
        "Energy & Performance",
        "Immunity",
        "Gut Health",
        "Cognitive Support",
        "Stress & Mood",
        "Beauty From Within",
        "Healthy Aging"
    ]
    
    output_records = []
    
    with open(overview_path, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.reader(f)
        header = next(reader)
        id_idx = header.index("DSLD ID")
        name_idx = header.index("Product Name")
        brand_idx = header.index("Brand Name")
        
        for row in reader:
            if len(row) > max(id_idx, name_idx, brand_idx):
                dsld_id = row[id_idx].strip()
                name = row[name_idx].strip()
                brand = row[brand_idx].strip()
                
                # Retrieve joined ingredients and claims
                product_ings = ingredients_map.get(dsld_id, [])
                product_claims = claims_map.get(dsld_id, [])
                
                if not product_ings:
                    continue # Skip products with zero ingredients for testing
                
                # Simple rule-based category matching
                category = "Immunity" # default fallback
                name_l = name.lower()
                ings_l = [i.lower() for i in product_ings]
                
                if any(w in name_l or any(w in ing for ing in ings_l) for w in ["sleep", "melatonin", "night", "relaxation", "somnus", "zzz"]):
                    category = "Sleep & Relaxation"
                elif any(w in name_l or any(w in ing for ing in ings_l) for w in ["energy", "creatine", "performance", "sport", "workout", "stamina", "caffeine"]):
                    category = "Energy & Performance"
                elif any(w in name_l or any(w in ing for ing in ings_l) for w in ["probiotic", "acidophilus", "microbiome", "gut", "digestive", "enzyme", "laxative"]):
                    category = "Gut Health"
                elif any(w in name_l or any(w in ing for ing in ings_l) for w in ["cognitive", "focus", "nootropic", "lion's mane", "memory", "brain", "concentration"]):
                    category = "Cognitive Support"
                elif any(w in name_l or any(w in ing for ing in ings_l) for w in ["stress", "ashwagandha", "cortisol", "calm", "anxiety", "mood"]):
                    category = "Stress & Mood"
                elif any(w in name_l or any(w in ing for ing in ings_l) for w in ["collagen", "biotin", "skin", "hair", "nail", "beauty"]):
                    category = "Beauty From Within"
                elif any(w in name_l or any(w in ing for ing in ings_l) for w in ["aging", "resveratrol", "longevity", "coq10", "nmn", "cell"]):
                    category = "Healthy Aging"
                elif any(w in name_l or any(w in ing for ing in ings_l) for w in ["immune", "zinc", "vitamin c", "elderberry", "cold", "defender"]):
                    category = "Immunity"

                # Generate random realistic values for revenue and momentum
                revenue = random.randint(250000, 4800000)
                momentum = round(random.uniform(1.0, 9.9), 1)
                
                # Format list joins
                claims_str = "; ".join(product_claims[:3])
                ingredients_str = "; ".join(product_ings)
                sku = f"DSLD-{dsld_id}"
                
                output_records.append({
                    "name": name,
                    "brand": brand,
                    "sku": sku,
                    "category": category,
                    "revenue": revenue,
                    "momentum": momentum,
                    "claims": claims_str if claims_str else "Supports overall wellness.",
                    "ingredients": ingredients_str
                })
                
                # Limit to 1000 records for optimal performance
                if len(output_records) >= 1000:
                    break

    print(f"Step 4: Writing {len(output_records)} records to dsld_market_catalog.csv...")
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["name", "brand", "sku", "category", "revenue", "momentum", "claims", "ingredients"])
        writer.writeheader()
        writer.writerows(output_records)

    print("Success! Clean joined dataset generated at dsld_market_catalog.csv.")

if __name__ == "__main__":
    convert()
