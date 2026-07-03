from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Evidence, Product
from app.schemas import ChatQueryRequest
from app.services.context_builder import build_chat_context
from app.services.gemini_service import generate_market_answer

router = APIRouter(prefix="/api/chat", tags=["AI Conversational Intelligence"])

@router.post("/query")
def chat_query(
    request: ChatQueryRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # 1. User authenticated by dependency
    # 2. Query length validated by Pydantic (max_length=500 in schemas.py)

    # 3-7. Analyze keywords, fetch products/evidence, build context
    context = build_chat_context(db, request.query)

    # 8-10. Send to Gemini, request structured JSON
    ai_response = generate_market_answer(request.query, context)

    # 11-12. Validate evidence IDs, remove invalid ones, hydrate matching ones
    findings = ai_response.get("key_findings", [])
    
    # Gather evidence IDs referenced by AI
    referenced_ids = set()
    for f in findings:
        if "evidence_ids" in f:
            referenced_ids.update(f["evidence_ids"])

    # Query DB to check which ones exist
    valid_evidence = []
    if referenced_ids:
        # Convert to list
        id_list = list(referenced_ids)
        db_evidences = db.query(Evidence).filter(Evidence.id.in_(id_list)).all()
        
        # Build map and list of actual existing evidence
        existing_ids = {e.id for e in db_evidences}
        
        # Filter key findings evidence list to only valid ones
        for f in findings:
            f["evidence_ids"] = [eid for eid in f.get("evidence_ids", []) if eid in existing_ids]

        # Hydrate full evidence records to return to UI
        for ev in db_evidences:
            valid_evidence.append({
                "id": ev.id,
                "product_id": ev.product_id,
                "product_name": ev.product.name,
                "evidence_type": ev.evidence_type,
                "description": ev.description,
                "confidence": ev.confidence,
                "source_name": ev.source.name if ev.source else "Unknown",
                "created_at": ev.created_at
            })

    # Update response with clean data
    ai_response["key_findings"] = findings
    ai_response["evidence"] = valid_evidence

    return ai_response
