from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.services.analytics import (
    build_executive_metrics, 
    calculate_category_revenue, 
    calculate_category_momentum, 
    find_emerging_signals,
    generate_local_executive_insights
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return build_executive_metrics(db)

@router.get("/category-opportunity")
def get_category_opportunity(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return calculate_category_revenue(db)

@router.get("/momentum")
def get_momentum(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return calculate_category_momentum(db)

@router.get("/emerging-signals")
def get_emerging_signals(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return find_emerging_signals(db)

@router.get("/executive-insights")
def get_executive_insights(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return generate_local_executive_insights(db)

@router.post("/executive-insights/refresh")
def refresh_executive_insights(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return generate_local_executive_insights(db)
