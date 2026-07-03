from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import RoleChecker
from app.models import AuditLog
from app.schemas import AuditLogResponse
from sqlalchemy import desc

router = APIRouter(prefix="/api/audit", tags=["Governance Audit Trail"])

gov_dependency = Depends(RoleChecker(["reviewer", "admin"]))

@router.get("", response_model=list[AuditLogResponse])
def get_audit_trail(db: Session = Depends(get_db), current_user=gov_dependency):
    logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).all()
    return logs
