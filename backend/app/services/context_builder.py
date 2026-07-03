from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models import Product, Category, Claim, Ingredient, ProductIngredient, Evidence, Brand
from app.services.analytics import calculate_market_coverage, find_emerging_signals

def build_chat_context(db: Session, query: str) -> str:
    """
    Analyzes query keywords to fetch relevant products, claims, and ingredients, 
    assembling a compact text context block.
    """
    # Simple keyword match
    keywords = [w.lower() for w in query.split() if len(w) > 3]
    
    # Base query for products
    prod_query = db.query(Product).join(Brand)
    
    if keywords:
        filters = []
        for kw in keywords:
            filters.append(Product.name.ilike(f"%{kw}%"))
            filters.append(Product.description.ilike(f"%{kw}%"))
            filters.append(Brand.name.ilike(f"%{kw}%"))
        prod_query = prod_query.filter(or_filter(*filters) if len(filters) > 1 else filters[0])
        
    products = prod_query.limit(8).all()
    
    # If no products matched directly, get top momentum products
    if not products:
        products = db.query(Product).order_by(Product.momentum_score.desc()).limit(5).all()

    context_lines = [
        "DATASET DISCLAIMER: This is illustrative, synthetic demonstration data for a prototype wellness supplement market analysis.",
        f"USER QUERY: {query}",
        "MATCHING / RELEVANT PRODUCTS IN DATASET:"
    ]
    
    for p in products:
        claims_list = [c.normalized_claim for c in p.claims[:3]]
        ing_list = [pi.ingredient.name for pi in p.ingredients[:3]]
        context_lines.append(
            f"- Product: '{p.name}' | Brand: '{p.brand.name}' | SKU: {p.sku} | Category: '{p.category.name}'\n"
            f"  Revenue: ${p.illustrative_revenue:,.2f} | Momentum: {p.momentum_score}/10 | AI Confidence: {p.ai_confidence * 100:.1f}%\n"
            f"  Ingredients: {', '.join(ing_list)}\n"
            f"  Claims: {'; '.join(claims_list)}"
        )
        
    # Get overall categories for references
    categories = db.query(Category).all()
    context_lines.append("\nAVAILABLE BENEFIT CATEGORIES:")
    for cat in categories:
        context_lines.append(f"- '{cat.name}': {cat.description}")
        
    return "\n".join(context_lines)


def build_dashboard_context(db: Session) -> str:
    """
    Creates context summarizing the entire market landscape.
    """
    coverage = calculate_market_coverage(db)
    signals = find_emerging_signals(db, limit=5)
    
    context_lines = [
        "DATASET DISCLAIMER: This is illustrative, synthetic demonstration data for a prototype wellness supplement market analysis.",
        "MARKET OVERVIEW METRICS:",
        f"- Total Products Tracked: {coverage['total_products']}",
        f"- Total Brands Analyzed: {coverage['total_brands']}",
        f"- Total Benefit Categories: {coverage['total_categories']}",
        f"- Total Extracted Claims: {coverage['total_claims']}",
        f"- Total Tracked Ingredients: {coverage['total_ingredients']}",
        f"- Average AI Classification Confidence: {coverage['avg_confidence'] * 100:.1f}%",
        f"- Total Segment Illustrative Revenue: ${coverage['total_revenue']:,.2f}",
        "\nCATEGORY BREAKDOWN:"
    ]
    
    for c in coverage["coverage_details"]:
        context_lines.append(
            f"- Category '{c['category_name']}': Products: {c['product_count']} | Revenue: ${c['revenue']:,.2f} | Average Momentum: {c['momentum']}/10"
        )
        
    context_lines.append("\nEMERGING HIGH-MOMENTUM / LOW-PRESENCE SIGNALS:")
    for s in signals:
        context_lines.append(
            f"- Product: '{s['product_name']}' | Brand: '{s['brand_name']}' | Category: '{s['category_name']}' | Revenue: ${s['revenue']:,.2f} | Momentum: {s['momentum']}/10"
        )
        
    return "\n".join(context_lines)


def build_product_context(db: Session, product_id: int) -> str:
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        return "Product not found."
        
    claims_list = [f"'{c.raw_text}' (weight: {c.weight}, confidence: {c.confidence})" for c in p.claims]
    ing_list = [f"'{pi.ingredient.name}' (dosage: {pi.dosage}, hero status: {pi.is_hero})" for pi in p.ingredients]
    evidence_list = [f"Type: {e.evidence_type} | Description: '{e.description}' (id: {e.id})" for e in p.evidence]
    
    categories = db.query(Category).all()
    cat_names = [cat.name for cat in categories]
    
    context_lines = [
        "DATASET DISCLAIMER: This is illustrative, synthetic demonstration data for a prototype wellness supplement market analysis.",
        f"PRODUCT IDENTITY:",
        f"- Name: {p.name}",
        f"- Brand: {p.brand.name}",
        f"- SKU: {p.sku}",
        f"- Current Classified Category: {p.category.name}",
        f"- Product Description: {p.description}",
        f"- Illustrative Revenue: ${p.illustrative_revenue:,.2f}",
        f"- Momentum Score: {p.momentum_score}/10",
        f"- AI Confidence: {p.ai_confidence * 100:.1f}%",
        f"- Review Status: {p.review_status}",
        "\nEXTRACTED CLAIMS:",
        * [f"  - {c}" for c in claims_list],
        "\nIDENTIFIED INGREDIENTS:",
        * [f"  - {i}" for i in ing_list],
        "\nSUPPORTING EVIDENCE:",
        * [f"  - {e}" for e in evidence_list],
        "\nALLOWED VALID CATEGORIES:",
        f"  {', '.join(cat_names)}"
    ]
    return "\n".join(context_lines)


def build_category_context(db: Session, category_id: int) -> str:
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        return "Category not found."
        
    # Get top products in this category
    products = db.query(Product).join(Brand).filter(Product.category_id == category_id).order_by(Product.illustrative_revenue.desc()).limit(8).all()
    
    context_lines = [
        "DATASET DISCLAIMER: This is illustrative, synthetic demonstration data for a prototype wellness supplement market analysis.",
        f"CATEGORY IDENTITY: '{cat.name}'",
        f"Description: {cat.description}",
        f"\nTOP PRODUCTS IN CATEGORY '{cat.name}':"
    ]
    
    for p in products:
        claims_list = [c.normalized_claim for c in p.claims[:2]]
        ing_list = [pi.ingredient.name for pi in p.ingredients[:2]]
        context_lines.append(
            f"- Product: '{p.name}' | Brand: '{p.brand.name}' | SKU: {p.sku}\n"
            f"  Revenue: ${p.illustrative_revenue:,.2f} | Momentum: {p.momentum_score}/10 | AI Confidence: {p.ai_confidence * 100:.1f}%\n"
            f"  Ingredients: {', '.join(ing_list)} | Claims: {'; '.join(claims_list)}"
        )
        
    return "\n".join(context_lines)


def or_filter(*filters):
    """ Helper to build SQL OR query filters. """
    return or_(*filters)
