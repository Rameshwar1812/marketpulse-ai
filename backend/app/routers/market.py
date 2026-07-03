from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Category, Product, Claim, ProductIngredient, Brand
from app.services.analytics import (
    calculate_market_coverage,
    get_top_ingredients,
    get_claim_frequency
)
from app.services.context_builder import build_category_context
from app.services.gemini_service import interpret_market_segment
from sqlalchemy import func, desc

router = APIRouter(prefix="/api/market", tags=["Market Explorer"])

@router.get("/categories")
def get_categories(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Category).all()

@router.get("/overview")
def get_overview(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return calculate_market_coverage(db)

@router.get("/ingredients")
def get_ingredients(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_top_ingredients(db, limit=20)

@router.get("/claims")
def get_claims(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_claim_frequency(db, limit=20)

@router.get("/category/{category_id}")
def get_category_detail(category_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    # Get statistics specific to this category
    product_count = db.query(func.count(Product.id)).filter(Product.category_id == category_id).scalar() or 0
    total_revenue = db.query(func.sum(Product.illustrative_revenue)).filter(Product.category_id == category_id).scalar() or 0.0
    avg_momentum = db.query(func.avg(Product.momentum_score)).filter(Product.category_id == category_id).scalar() or 0.0
    avg_confidence = db.query(func.avg(Product.ai_confidence)).filter(Product.category_id == category_id).scalar() or 0.0
    
    # Top Products
    products = db.query(Product).join(Brand).filter(Product.category_id == category_id)\
                 .order_by(desc(Product.illustrative_revenue)).limit(5).all()
                 
    # Top Ingredients in category
    ingredients = db.query(
        Ingredient_Name:=func.min(Ingredient_Table:=func.min(ProductIngredient.ingredient_id)), # placeholder, let's write simple group by
    )
    # Let's write a standard clean query for top ingredients in category
    from app.models import Ingredient
    top_ingredients = db.query(
        Ingredient.name,
        func.count(ProductIngredient.id).label("count")
    ).join(ProductIngredient, ProductIngredient.ingredient_id == Ingredient.id)\
     .join(Product, ProductIngredient.product_id == Product.id)\
     .filter(Product.category_id == category_id)\
     .group_by(Ingredient.name)\
     .order_by(desc("count")).limit(5).all()
     
    # Top Claims in category
    top_claims = db.query(
        Claim.normalized_claim,
        func.count(Claim.id).label("count")
    ).filter(Claim.category_id == category_id)\
     .group_by(Claim.normalized_claim)\
     .order_by(desc("count")).limit(5).all()
     
    return {
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "product_count": product_count,
        "total_revenue": float(total_revenue),
        "avg_momentum": round(float(avg_momentum), 2),
        "avg_confidence": round(float(avg_confidence), 2),
        "top_products": [
            {
                "id": p.id,
                "name": p.name,
                "brand_name": p.brand.name,
                "revenue": p.illustrative_revenue,
                "momentum": p.momentum_score
            }
            for p in products
        ],
        "top_ingredients": [{"name": i[0], "count": i[1]} for i in top_ingredients],
        "top_claims": [{"claim": c[0], "count": c[1]} for c in top_claims]
    }

@router.post("/category/{category_id}/interpret")
def interpret_category(category_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    context = build_category_context(db, category_id)
    interpretation = interpret_market_segment(context)
    return interpretation
