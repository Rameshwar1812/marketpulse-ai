import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import RoleChecker, get_current_user
from app.models import Review, Product, Category, AuditLog
from app.schemas import ReviewResponse, ReviewDecisionRequest

router = APIRouter(prefix="/api/reviews", tags=["Human Governance Review Queue"])

# Only reviewers and admins can access governance routes
gov_dependency = Depends(RoleChecker(["reviewer", "admin"]))

@router.get("", response_model=list[ReviewResponse])
def get_reviews(db: Session = Depends(get_db), current_user=gov_dependency):
    reviews = db.query(Review).all()
    results = []
    for r in reviews:
        results.append({
            "id": r.id,
            "product_id": r.product_id,
            "product_name": r.product.name if r.product else "Unknown Product",
            "brand_name": r.product.brand.name if r.product and r.product.brand else "Unknown Brand",
            "status": r.status,
            "reason_flagged": r.reason_flagged,
            "ai_recommendation": r.ai_recommendation,
            "ai_confidence": r.ai_confidence,
            "reviewer_decision": r.reviewer_decision,
            "reviewer_name": r.reviewer_name,
            "reviewer_reason": r.reviewer_reason,
            "created_at": r.created_at,
            "resolved_at": r.resolved_at
        })
    return results

@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(review_id: int, db: Session = Depends(get_db), current_user=gov_dependency):
    r = db.query(Review).filter(Review.id == review_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Review item not found")
        
    return {
        "id": r.id,
        "product_id": r.product_id,
        "product_name": r.product.name if r.product else "Unknown Product",
        "brand_name": r.product.brand.name if r.product and r.product.brand else "Unknown Brand",
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

@router.post("/{review_id}/approve")
def approve_classification(review_id: int, db: Session = Depends(get_db), current_user=gov_dependency):
    r = db.query(Review).filter(Review.id == review_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Review item not found")
    if r.status != "pending":
        raise HTTPException(status_code=400, detail="Review item has already been resolved")

    p = db.query(Product).filter(Product.id == r.product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Associated product not found")

    try:
        # Update Review
        r.status = "approved"
        r.reviewer_decision = "approved"
        r.reviewer_name = current_user.full_name
        r.reviewer_reason = "AI recommendation is correct based on claims evidence."
        r.resolved_at = datetime.datetime.utcnow()

        # Update Product status
        previous_status = p.review_status
        p.review_status = "approved"
        p.ai_confidence = 1.0  # Confirmed by human

        # Log audit trail
        audit = AuditLog(
            entity_type="product",
            entity_id=p.id,
            action="approve_classification",
            previous_value=previous_status,
            new_value="approved",
            reason=r.reviewer_reason,
            user_name=current_user.full_name,
            model_name="N/A",
            created_at=datetime.datetime.utcnow()
        )
        db.add(audit)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database update failed. Transaction rolled back: {str(e)}")

    return {"status": "success", "message": "Product classification approved successfully."}

@router.post("/{review_id}/override")
def override_classification(
    review_id: int, 
    request: ReviewDecisionRequest, 
    db: Session = Depends(get_db), 
    current_user=gov_dependency
):
    r = db.query(Review).filter(Review.id == review_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Review item not found")
    if r.status != "pending":
        raise HTTPException(status_code=400, detail="Review item has already been resolved")

    p = db.query(Product).filter(Product.id == r.product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Associated product not found")

    if not request.override_category_id:
        raise HTTPException(status_code=400, detail="override_category_id is required for overrides")

    new_cat = db.query(Category).filter(Category.id == request.override_category_id).first()
    if not new_cat:
        raise HTTPException(status_code=404, detail="Target reclassification category not found")

    old_cat = p.category

    try:
        # Update Review
        r.status = "overridden"
        r.reviewer_decision = "overridden"
        r.reviewer_name = current_user.full_name
        r.reviewer_reason = request.reason
        r.resolved_at = datetime.datetime.utcnow()

        # Update Product category & status
        p.category_id = request.override_category_id
        p.review_status = "overridden"
        p.ai_confidence = 1.0  # Certified by human

        # Log audit trail
        audit = AuditLog(
            entity_type="product",
            entity_id=p.id,
            action="override_classification",
            previous_value=old_cat.name if old_cat else "None",
            new_value=new_cat.name,
            reason=request.reason,
            user_name=current_user.full_name,
            model_name="gemini-2.5-flash",
            created_at=datetime.datetime.utcnow()
        )
        db.add(audit)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database update failed. Transaction rolled back: {str(e)}")

    return {"status": "success", "message": f"Product reclassified to '{new_cat.name}' successfully."}

@router.post("/{review_id}/send-back")
def send_back_classification(
    review_id: int, 
    request: ReviewDecisionRequest, 
    db: Session = Depends(get_db), 
    current_user=gov_dependency
):
    r = db.query(Review).filter(Review.id == review_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Review item not found")
    if r.status != "pending":
        raise HTTPException(status_code=400, detail="Review item has already been resolved")

    p = db.query(Product).filter(Product.id == r.product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Associated product not found")

    try:
        # Update Review
        r.status = "sent_back"
        r.reviewer_decision = "sent_back"
        r.reviewer_name = current_user.full_name
        r.reviewer_reason = request.reason
        r.resolved_at = datetime.datetime.utcnow()

        # Update Product
        previous_status = p.review_status
        p.review_status = "sent_back"

        # Log audit trail
        audit = AuditLog(
            entity_type="product",
            entity_id=p.id,
            action="send_back_classification",
            previous_value=previous_status,
            new_value="sent_back",
            reason=request.reason,
            user_name=current_user.full_name,
            model_name="N/A",
            created_at=datetime.datetime.utcnow()
        )
        db.add(audit)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database update failed. Transaction rolled back: {str(e)}")

    return {"status": "success", "message": "Product sent back for ingestion recount."}
