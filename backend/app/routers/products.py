from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Product, Brand, Category, Claim, ProductIngredient, Evidence, Review
from app.services.context_builder import build_product_context
from app.services.gemini_service import analyze_product_classification
from app.services.attribution import calculate_attribution
from sqlalchemy import desc, asc, func
from typing import Optional, List

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("")
def get_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    min_confidence: Optional[float] = None,
    review_status: Optional[str] = None,
    sort: str = "revenue_desc",
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Product).join(Brand).join(Category)

    # Search filter
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_filter)) | 
            (Product.sku.ilike(search_filter)) |
            (Brand.name.ilike(search_filter))
        )

    # Category filter
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)

    # Brand filter
    if brand_id is not None:
        query = query.filter(Product.brand_id == brand_id)

    # Confidence filter
    if min_confidence is not None:
        query = query.filter(Product.ai_confidence >= min_confidence)

    # Review status filter
    if review_status:
        query = query.filter(Product.review_status == review_status)

    # Total count before pagination
    total = query.count()

    # Sorting
    if sort == "revenue_desc":
        query = query.order_by(desc(Product.illustrative_revenue))
    elif sort == "revenue_asc":
        query = query.order_by(asc(Product.illustrative_revenue))
    elif sort == "momentum_desc":
        query = query.order_by(desc(Product.momentum_score))
    elif sort == "momentum_asc":
        query = query.order_by(asc(Product.momentum_score))
    elif sort == "confidence_desc":
        query = query.order_by(desc(Product.ai_confidence))
    else:
        query = query.order_by(desc(Product.created_at))

    # Pagination
    products = query.offset(offset).limit(limit).all()

    # Formulate output list
    results = []
    for p in products:
        results.append({
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "brand_name": p.brand.name,
            "category_name": p.category.name,
            "illustrative_revenue": p.illustrative_revenue,
            "momentum_score": p.momentum_score,
            "ai_confidence": p.ai_confidence,
            "review_status": p.review_status,
            "description": p.description,
            "claims": [c.normalized_claim for c in p.claims[:2]]
        })

    return {
        "products": results,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@router.get("/{product_id}")
def get_product_detail(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    product = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.claims),
        joinedload(Product.evidence)
    ).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get ingredients mapping
    ingredients_mapping = db.query(ProductIngredient).options(
        joinedload(ProductIngredient.ingredient)
    ).filter(ProductIngredient.product_id == product_id).all()
    
    ingredients_list = [
        {
            "ingredient_id": im.ingredient_id,
            "name": im.ingredient.name,
            "dosage": im.dosage,
            "is_hero": im.is_hero,
            "confidence": im.confidence
        }
        for im in ingredients_mapping
    ]

    # Attribution calculations
    attribution_list = calculate_attribution(product.illustrative_revenue, product.claims)

    # Find open reviews
    reviews_mapping = db.query(Review).filter(Review.product_id == product_id).order_by(desc(Review.created_at)).all()

    return {
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "brand_name": product.brand.name,
        "brand_id": product.brand.id,
        "category_name": product.category.name,
        "category_id": product.category.id,
        "description": product.description,
        "illustrative_revenue": product.illustrative_revenue,
        "momentum_score": product.momentum_score,
        "ai_confidence": product.ai_confidence,
        "review_status": product.review_status,
        "source_id": product.source_id,
        "claims": [
            {
                "id": c.id,
                "raw_text": c.raw_text,
                "normalized_claim": c.normalized_claim,
                "confidence": c.confidence,
                "weight": c.weight
            }
            for c in product.claims
        ],
        "ingredients": ingredients_list,
        "attribution": attribution_list,
        "evidence": [
            {
                "id": e.id,
                "evidence_type": e.evidence_type,
                "description": e.description,
                "confidence": e.confidence,
                "source_name": e.source.name if e.source else "Unknown",
                "created_at": e.created_at
            }
            for e in product.evidence
        ],
        "reviews": [
            {
                "id": r.id,
                "status": r.status,
                "reason_flagged": r.reason_flagged,
                "ai_recommendation": r.ai_recommendation,
                "ai_confidence": r.ai_confidence,
                "reviewer_decision": r.reviewer_decision,
                "reviewer_name": r.reviewer_name,
                "reviewer_reason": r.reviewer_reason,
                "created_at": r.created_at,
                "resolved_at": r.resolved_at
            }
            for r in reviews_mapping
        ]
    }

@router.get("/{product_id}/evidence")
def get_product_evidence_lineage(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Generate a beautiful lineage timeline
    timeline = []
    
    # 1. Ingestion step
    timeline.append({
        "step": "Source Ingestion",
        "timestamp": product.created_at,
        "status": "completed",
        "confidence": 1.0,
        "details": f"Data pulled from source reference: '{product.source.reference if product.source else 'System Ingestion'}'."
    })
    
    # 2. Extract evidence
    for ev in product.evidence:
        timeline.append({
            "step": "Evidence Registered",
            "timestamp": ev.created_at,
            "status": "completed",
            "confidence": ev.confidence,
            "details": f"[{ev.evidence_type}] {ev.description}"
        })
        
    # 3. Claims Extracted
    if product.claims:
        timeline.append({
            "step": "Claims Extraction",
            "timestamp": product.claims[0].created_at,
            "status": "completed",
            "confidence": sum(c.confidence for c in product.claims) / len(product.claims),
            "details": f"Identified {len(product.claims)} distinct benefit claims mapping to Category '{product.category.name}'."
        })
        
    # 4. Revenue Attribution
    timeline.append({
        "step": "Revenue Attribution",
        "timestamp": product.updated_at,
        "status": "completed",
        "confidence": 0.95,
        "details": f"Attributed ${product.illustrative_revenue:,.2f} product revenue across {len(product.claims)} claim weights."
    })
    
    # 5. Review Status
    if product.review_status == "approved":
        timeline.append({
            "step": "Human Validation",
            "timestamp": product.updated_at,
            "status": "approved",
            "confidence": 1.0,
            "details": "AI classifications fully reviewed and approved by compliance team."
        })
    elif product.review_status == "overridden":
        timeline.append({
            "step": "Human Override",
            "timestamp": product.updated_at,
            "status": "overridden",
            "confidence": 1.0,
            "details": "AI recommendations overridden by compliance reviewer. Audit trail logged."
        })
    elif product.review_status == "pending":
        timeline.append({
            "step": "Awaiting Human Review",
            "timestamp": product.updated_at,
            "status": "pending",
            "confidence": product.ai_confidence,
            "details": "Flagged for manual verification due to sub-threshold classification confidence."
        })
        
    # Sort timeline by timestamp
    timeline.sort(key=lambda x: x["timestamp"])
    return timeline

@router.post("/{product_id}/analyze-classification")
def analyze_classification(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    context = build_product_context(db, product_id)
    analysis = analyze_product_classification(context)
    return analysis
