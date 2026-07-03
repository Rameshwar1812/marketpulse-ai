from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from datetime import datetime

# Auth / User Schemas
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: str = "analyst"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Brand Schemas
class BrandBase(BaseModel):
    name: str
    market_segment: Optional[str] = None

class BrandResponse(BrandBase):
    id: int

    class Config:
        from_attributes = True

# Source Schemas
class SourceBase(BaseModel):
    name: str
    source_type: str
    reference: Optional[str] = None
    collection_method: Optional[str] = None
    status: str
    data_quality_score: float

class SourceResponse(SourceBase):
    id: int
    last_refresh: datetime

    class Config:
        from_attributes = True

# Claim Schemas
class ClaimBase(BaseModel):
    raw_text: str
    normalized_claim: Optional[str] = None
    category_id: Optional[int] = None
    confidence: float
    weight: float

class ClaimResponse(ClaimBase):
    id: int
    product_id: int
    category_name: Optional[str] = None

    class Config:
        from_attributes = True

# Ingredient Schemas
class IngredientBase(BaseModel):
    name: str
    description: Optional[str] = None

class IngredientResponse(IngredientBase):
    id: int

    class Config:
        from_attributes = True

class ProductIngredientResponse(BaseModel):
    ingredient_id: int
    name: str
    dosage: Optional[str] = None
    is_hero: bool
    confidence: float

    class Config:
        from_attributes = True

# Evidence Schemas
class EvidenceBase(BaseModel):
    evidence_type: str
    description: str
    source_id: int
    confidence: float

class EvidenceResponse(EvidenceBase):
    id: int
    product_id: int
    source_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Review Schemas
class ReviewBase(BaseModel):
    status: str
    reason_flagged: Optional[str] = None
    ai_recommendation: Optional[str] = None
    ai_confidence: Optional[float] = None

class ReviewResponse(ReviewBase):
    id: int
    product_id: int
    product_name: str
    brand_name: str
    reviewer_decision: Optional[str] = None
    reviewer_name: Optional[str] = None
    reviewer_reason: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ReviewDecisionRequest(BaseModel):
    decision: str  # approved, overridden, sent_back
    reason: str
    override_category_id: Optional[int] = None

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    action: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    reason: Optional[str] = None
    user_name: Optional[str] = None
    model_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    sku: str
    brand_id: int
    category_id: int
    description: Optional[str] = None
    illustrative_revenue: float
    momentum_score: float
    ai_confidence: float
    review_status: str

class ProductResponse(ProductBase):
    id: int
    brand_name: str
    category_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProductDetailResponse(ProductResponse):
    claims: List[ClaimResponse] = []
    ingredients: List[ProductIngredientResponse] = []
    evidence: List[EvidenceResponse] = []
    reviews: List[ReviewBase] = []

    class Config:
        from_attributes = True

# Chat & Gemini Schemas
class ChatQueryRequest(BaseModel):
    query: str = Field(..., max_length=500)

class KeyFinding(BaseModel):
    title: str
    finding: str
    metric: str
    evidence_ids: List[int]

class ChatResponse(BaseModel):
    answer: str
    key_findings: List[KeyFinding]
    confidence: float
    evidence: List[EvidenceResponse] = []
    follow_up_questions: List[str] = []

class CSVValidationResponse(BaseModel):
    filename: str
    rows_found: int
    valid_rows: int
    invalid_rows: int
    warnings: List[str] = []
    valid_records: List[dict] = []
