from typing import List, Dict, Any

def calculate_attribution(revenue: float, claims: List[Any]) -> List[Dict[str, Any]]:
    """
    Applies the revenue attribution formula:
    attributed_revenue = illustrative_revenue * claim_weight
    
    Verifies that the sum of claim weights equals 1.0. If not, it renormalizes.
    """
    if not claims:
        return []

    # Filter out claims with None weights
    valid_claims = [c for c in claims if c.weight is not None]
    if not valid_claims:
        return []

    total_weight = sum(c.weight for c in valid_claims)
    
    # Renormalize weights if they don't sum to exactly 1.0
    renormalize = abs(total_weight - 1.0) > 1e-5
    
    results = []
    accumulated_revenue = 0.0
    
    for idx, claim in enumerate(valid_claims):
        weight = claim.weight
        if renormalize and total_weight > 0:
            weight = weight / total_weight
            
        # For the last element, use remainder to prevent floating rounding mismatch
        if idx == len(valid_claims) - 1:
            attr_revenue = revenue - accumulated_revenue
        else:
            attr_revenue = round(revenue * weight, 2)
            accumulated_revenue += attr_revenue

        # Rationale string
        rationale = (
            f"Attributed {weight * 100:.1f}% of total product revenue of ${revenue:,.2f} "
            f"based on AI claim significance rating in the {claim.category.name if claim.category else 'General'} category."
        )
        
        results.append({
            "claim_id": claim.id,
            "raw_text": claim.raw_text,
            "normalized_claim": claim.normalized_claim,
            "weight": round(weight, 3),
            "attributed_revenue": round(attr_revenue, 2),
            "rationale": rationale
        })
        
    return results
