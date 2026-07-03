import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="analyst") # executive, analyst, reviewer, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    products = relationship("Product", back_populates="category")

class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    market_segment = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    products = relationship("Product", back_populates="brand")

class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    source_type = Column(String) # Market Report, Public Web, Retailer Page, Image
    reference = Column(String)
    collection_method = Column(String)
    last_refresh = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String) # Active, Refreshing, Error
    data_quality_score = Column(Float, default=1.0)

    products = relationship("Product", back_populates="source")
    evidence = relationship("Evidence", back_populates="source")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    description = Column(String)
    illustrative_revenue = Column(Float, default=0.0)
    momentum_score = Column(Float, default=0.0)
    ai_confidence = Column(Float, default=1.0)
    review_status = Column(String, default="approved") # pending, approved, overridden, sent_back
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    brand = relationship("Brand", back_populates="products")
    category = relationship("Category", back_populates="products")
    source = relationship("Source", back_populates="products")
    claims = relationship("Claim", back_populates="product", cascade="all, delete-orphan")
    ingredients = relationship("ProductIngredient", back_populates="product", cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    raw_text = Column(String, nullable=False)
    normalized_claim = Column(String)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    confidence = Column(Float, default=1.0)
    weight = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="claims")
    category = relationship("Category")

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)

    products = relationship("ProductIngredient", back_populates="ingredient")

class ProductIngredient(Base):
    __tablename__ = "product_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    dosage = Column(String)
    is_hero = Column(Boolean, default=False)
    confidence = Column(Float, default=1.0)

    product = relationship("Product", back_populates="ingredients")
    ingredient = relationship("Ingredient", back_populates="products")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    evidence_type = Column(String) # Label, Study, Third Party, Retailer
    description = Column(String, nullable=False)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="evidence")
    source = relationship("Source", back_populates="evidence")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    status = Column(String, default="pending") # pending, approved, overridden, sent_back
    reason_flagged = Column(String)
    ai_recommendation = Column(String)
    ai_confidence = Column(Float)
    reviewer_decision = Column(String) # approved, overridden, sent_back
    reviewer_name = Column(String)
    reviewer_reason = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    product = relationship("Product", back_populates="reviews")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False) # e.g., product, claim, review
    entity_id = Column(Integer, nullable=False)
    action = Column(String, nullable=False) # e.g., create, override, approve
    previous_value = Column(String)
    new_value = Column(String)
    reason = Column(String)
    user_name = Column(String)
    model_name = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
