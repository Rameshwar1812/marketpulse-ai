from sqlalchemy import func, desc, or_
from sqlalchemy.orm import Session
from app.models import Product, Category, Brand, Claim, Ingredient, ProductIngredient, Evidence, Review

def calculate_category_revenue(db: Session):
    """
    Returns total illustrative revenue grouped by category.
    """
    results = db.query(
        Category.id.label("category_id"),
        Category.name.label("category_name"),
        func.sum(Product.illustrative_revenue).label("total_revenue"),
        func.count(Product.id).label("product_count")
    ).join(Product, Product.category_id == Category.id)\
     .group_by(Category.id, Category.name)\
     .order_by(desc("total_revenue")).all()
     
    return [
        {
            "category_id": r.category_id,
            "category_name": r.category_name,
            "total_revenue": float(r.total_revenue or 0.0),
            "product_count": r.product_count
        }
        for r in results
    ]

def calculate_category_momentum(db: Session):
    """
    Returns average momentum score grouped by category.
    """
    results = db.query(
        Category.id.label("category_id"),
        Category.name.label("category_name"),
        func.avg(Product.momentum_score).label("avg_momentum"),
        func.count(Product.id).label("product_count")
    ).join(Product, Product.category_id == Category.id)\
     .group_by(Category.id, Category.name)\
     .order_by(desc("avg_momentum")).all()
     
    return [
        {
            "category_id": r.category_id,
            "category_name": r.category_name,
            "avg_momentum": round(float(r.avg_momentum or 0.0), 2),
            "product_count": r.product_count
        }
        for r in results
    ]

def get_top_ingredients(db: Session, limit: int = 10):
    """
    Counts ingredients across all products, weighted by illustrative revenue.
    """
    results = db.query(
        Ingredient.id.label("ingredient_id"),
        Ingredient.name.label("ingredient_name"),
        func.count(ProductIngredient.product_id).label("product_count"),
        func.sum(Product.illustrative_revenue).label("attributed_revenue"),
        func.sum(func.cast(ProductIngredient.is_hero, func.Integer)).label("hero_count")
    ).join(ProductIngredient, ProductIngredient.ingredient_id == Ingredient.id)\
     .join(Product, ProductIngredient.product_id == Product.id)\
     .group_by(Ingredient.id, Ingredient.name)\
     .order_by(desc("product_count")).limit(limit).all()
     
    return [
        {
            "ingredient_id": r.ingredient_id,
            "ingredient_name": r.ingredient_name,
            "product_count": r.product_count,
            "attributed_revenue": float(r.attributed_revenue or 0.0),
            "hero_count": int(r.hero_count or 0)
        }
        for r in results
    ]

def get_claim_frequency(db: Session, limit: int = 10):
    """
    Groups claims by normalized representation and counts them.
    """
    results = db.query(
        Claim.normalized_claim.label("claim"),
        Category.name.label("category_name"),
        func.count(Claim.id).label("claim_count"),
        func.avg(Claim.confidence).label("avg_confidence")
    ).join(Category, Claim.category_id == Category.id)\
     .group_by(Claim.normalized_claim, Category.name)\
     .order_by(desc("claim_count")).limit(limit).all()
     
    return [
        {
            "claim": r.claim,
            "category_name": r.category_name,
            "count": r.claim_count,
            "avg_confidence": round(float(r.avg_confidence or 0.0), 2)
        }
        for r in results
    ]

def find_emerging_signals(db: Session, limit: int = 6):
    """
    Emerging signals: Products or ingredients that have high momentum (> 6.0) 
    but low market presence (revenue < $1,000,000).
    """
    results = db.query(
        Product.id.label("product_id"),
        Product.name.label("product_name"),
        Brand.name.label("brand_name"),
        Category.name.label("category_name"),
        Product.illustrative_revenue.label("revenue"),
        Product.momentum_score.label("momentum"),
        Product.ai_confidence.label("confidence")
    ).join(Brand, Product.brand_id == Brand.id)\
     .join(Category, Product.category_id == Category.id)\
     .filter(Product.momentum_score >= 6.0)\
     .filter(Product.illustrative_revenue < 1000000)\
     .order_by(desc(Product.momentum_score))\
     .limit(limit).all()
     
    return [
        {
            "product_id": r.product_id,
            "product_name": r.product_name,
            "brand_name": r.brand_name,
            "category_name": r.category_name,
            "revenue": float(r.revenue),
            "momentum": float(r.momentum),
            "confidence": float(r.confidence)
        }
        for r in results
    ]

def calculate_market_coverage(db: Session):
    """
    Returns an aggregation summary of database coverage metrics.
    """
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_brands = db.query(func.count(Brand.id)).scalar() or 0
    total_categories = db.query(func.count(Category.id)).scalar() or 0
    total_claims = db.query(func.count(Claim.id)).scalar() or 0
    total_ingredients = db.query(func.count(Ingredient.id)).scalar() or 0
    avg_confidence = db.query(func.avg(Product.ai_confidence)).scalar() or 0.0
    total_revenue = db.query(func.sum(Product.illustrative_revenue)).scalar() or 0.0
    
    # Calculate categories and brands metrics
    categories_coverage = db.query(
        Category.name.label("category_name"),
        func.count(Product.id).label("product_count"),
        func.sum(Product.illustrative_revenue).label("revenue"),
        func.avg(Product.momentum_score).label("avg_momentum")
    ).join(Product, Product.category_id == Category.id)\
     .group_by(Category.name).all()
     
    coverage_details = [
        {
            "category_name": c.category_name,
            "product_count": c.product_count,
            "revenue": float(c.revenue or 0.0),
            "momentum": round(float(c.avg_momentum or 0.0), 2)
        }
        for c in categories_coverage
    ]
    
    return {
        "total_products": total_products,
        "total_brands": total_brands,
        "total_categories": total_categories,
        "total_claims": total_claims,
        "total_ingredients": total_ingredients,
        "avg_confidence": round(float(avg_confidence), 2),
        "total_revenue": float(total_revenue),
        "coverage_details": coverage_details
    }

def get_low_confidence_products(db: Session, threshold: float = 0.70):
    return db.query(Product).filter(Product.ai_confidence < threshold).all()

def build_executive_metrics(db: Session):
    """
    Builds the high level summary metrics showing manual baseline hours vs automation.
    """
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_categories = db.query(func.count(Category.id)).scalar() or 0
    total_claims = db.query(func.count(Claim.id)).scalar() or 0
    total_ingredients = db.query(func.count(Ingredient.id)).scalar() or 0
    
    # Baseline comparison constants
    annual_manual_hours_baseline = 1000  # 800 - 1000 hours
    # Illustrative scenario: AI speeds up analysis by 80%
    hours_saved_illustrative = 800 
    
    return {
        "products_analyzed": total_products,
        "benefit_categories": total_categories,
        "claims_extracted": total_claims,
        "hero_ingredients": total_ingredients,
        "annual_manual_effort_baseline": annual_manual_hours_baseline,
        "illustrative_automation_saving": hours_saved_illustrative,
        "automation_percentage": 80.0
    }

def generate_local_executive_insights(db: Session):
    """
    Computes exactly 3 high-impact executive observations using SQL aggregates.
    Bypasses Gemini API call to conserve API key quota.
    """
    product_count = db.query(Product).count()
    if product_count == 0:
        return [
            {
                "number": 1,
                "headline": "Workspace Ready for Ingestion",
                "explanation": "The catalog is currently empty. Upload a product catalog in the Data Sources tab to start analysis.",
                "confidence": 1.0,
                "evidence_count": 0
            },
            {
                "number": 2,
                "headline": "Compliance Review Queue Active",
                "explanation": "Low-confidence classifications will automatically hold for human review and override controls.",
                "confidence": 1.0,
                "evidence_count": 0
            },
            {
                "number": 3,
                "headline": "Lineage Audit Logging Enabled",
                "explanation": "All analyst mapping overrides and active dataset changes are captured in the secure Audit Trail.",
                "confidence": 1.0,
                "evidence_count": 0
            }
        ]
        
    highest_mom = db.query(Category.name, func.avg(Product.momentum_score).label("avg_mom"), func.count(Product.id).label("cnt"))\
        .join(Product, Product.category_id == Category.id)\
        .group_by(Category.name)\
        .order_by(desc("avg_mom")).first()
        
    highest_rev = db.query(Category.name, func.sum(Product.illustrative_revenue).label("total_rev"))\
        .join(Product, Product.category_id == Category.id)\
        .group_by(Category.name)\
        .order_by(desc("total_rev")).first()
        
    highest_prod = db.query(Product.name, Product.momentum_score, Brand.name.label("brand_name"))\
        .join(Brand, Product.brand_id == Brand.id)\
        .order_by(desc(Product.momentum_score)).first()
        
    observations = []
    if highest_mom:
        observations.append({
            "number": 1,
            "headline": f"{highest_mom[0]} Category Exhibits Strongest Momentum",
            "explanation": f"This category leads in average momentum index ({round(highest_mom[1], 1)}/10) across {highest_mom[2]} products.",
            "confidence": 0.95,
            "evidence_count": int(highest_mom[2])
        })
    if highest_rev:
        cat_p_count = db.query(Product).join(Category).filter(Category.name == highest_rev[0]).count()
        observations.append({
            "number": 2,
            "headline": f"{highest_rev[0]} Generates Top Market Revenue Share",
            "explanation": f"Supplement products in this category lead the catalog with a combined illustrative revenue of ${round(highest_rev[1]/1000000, 1)}M across {cat_p_count} products.",
            "confidence": 0.90,
            "evidence_count": int(cat_p_count)
        })
    if highest_prod:
        observations.append({
            "number": 3,
            "headline": f"Product '{highest_prod[0]}' Leads Early Velocity",
            "explanation": f"Developed by {highest_prod[2]}, this product showcases a high velocity momentum score of {highest_prod[1]}/10.",
            "confidence": 0.95,
            "evidence_count": 1
        })
        
    while len(observations) < 3:
        observations.append({
            "number": len(observations) + 1,
            "headline": "System Operations Active",
            "explanation": "Active supplement databases are continuously analyzed for category growth whitespace.",
            "confidence": 1.0,
            "evidence_count": 0
        })
        
    return observations
