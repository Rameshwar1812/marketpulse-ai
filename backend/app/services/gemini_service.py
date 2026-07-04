import os
import json
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List, Optional
from app.config import settings

# Define helper models for structured LLM outputs
class KeyFindingSchema(BaseModel):
    title: str = Field(description="Short, impactful headline for this finding")
    finding: str = Field(description="Detailed observation or finding based on the context data")
    metric: str = Field(description="Quantifiable metric, e.g. '$1.2M Revenue', '9.4 Avg Momentum', or '3 Products'")
    evidence_ids: List[int] = Field(default=[], description="List of evidence IDs from the context supporting this finding")

class ChatResponseSchema(BaseModel):
    answer: str = Field(description="Executive-ready clear and concise response to the user query")
    key_findings: List[KeyFindingSchema] = Field(description="A list of 2-4 key data-driven findings")
    confidence: float = Field(description="AI confidence score for this analysis, between 0.0 and 1.0")
    follow_up_questions: List[str] = Field(default=[], description="2-3 relevant follow-up questions the user might ask next")

class ExecutiveObservation(BaseModel):
    number: int = Field(description="Insight number, starting from 1")
    headline: str = Field(description="Short summary of the trend/insight")
    explanation: str = Field(description="1-2 sentences expanding on the trend and why it matters")
    confidence: float = Field(description="AI confidence score, between 0.0 and 1.0")
    evidence_count: int = Field(description="Number of products or data points supporting this observation")

class ExecutiveBriefResponse(BaseModel):
    observations: List[ExecutiveObservation] = Field(description="A list of exactly 3 executive observations")

class ClassificationAnalysisResponse(BaseModel):
    recommended_category: str = Field(description="The benefit category this product fits best")
    confidence: float = Field(description="AI confidence score, between 0.0 and 1.0")
    reasoning: str = Field(description="Detailed analytical reasoning for this recommendation")
    suggested_claims_remapping: List[str] = Field(default=[], description="Suggestions for remapping specific claims")

class SegmentInterpretationResponse(BaseModel):
    summary: str = Field(description="Executive overview summarizing this market segment")
    key_drivers: List[str] = Field(description="2-3 key market drivers in this category")
    growth_opportunities: List[str] = Field(description="2-3 under-served or high-momentum niches in this category")
    underrepresented_claims: List[str] = Field(description="1-2 claims or benefits that are rare in this category")

# Initialize client
client = None
if settings.GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"Gemini client initialization failed: {e}")

# Instructions for Gemini (Grounded in context, synthethic warning, executive style)
SYSTEM_INSTRUCTION = """
You are MarketPulse AI, a senior market analyst and executive copilot in the wellness supplements industry.
You operate on a synthetic demonstration dataset. You must NEVER invent external market facts, brands, or products.
Answer questions ONLY from the supplied context. If the context does not contain the answer, clearly state that the information is unavailable in the current dataset.
Distinguish observations (what the data says) from interpretation (what it might mean).
Use clean, executive language. Avoid marketing hype. Mention uncertainty where appropriate.
Prefer quantified observations (e.g. '$1.2M revenue' instead of 'large sales'). Keep responses concise and focused.
"""

def generate_market_answer(query: str, context: str) -> dict:
    """
    Answers a user query using context from the database.
    """
    if not client:
        return {
            "answer": "Gemini AI is not configured. Add GEMINI_API_KEY to enable AI analysis. The underlying database and tables remain fully accessible.",
            "key_findings": [
                {
                    "title": "Database Active",
                    "finding": "The local SQLite database contains 48 seeded products across 8 categories.",
                    "metric": "48 Products",
                    "evidence_ids": []
                }
            ],
            "confidence": 0.0,
            "evidence": [],
            "follow_up_questions": [
                "Where is momentum accelerating?",
                "Which categories show strong momentum but low market presence?"
            ]
        }

    prompt = f"Context:\n{context}\n\nQuery: {query}\n\nAnalyze the data context and construct a structured JSON response answering the query."

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=ChatResponseSchema,
                temperature=0.2
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini API error in generate_market_answer: {e}")
        return {
            "answer": "AI analysis is temporarily unavailable. The underlying market data remains accessible.",
            "key_findings": [],
            "confidence": 0.0,
            "evidence": [],
            "follow_up_questions": []
        }

def generate_executive_summary(context: str) -> list:
    """
    Generates 3 executive insights from the overall market overview context.
    """
    if not client:
        return [
            {
                "number": 1,
                "headline": "Sleep & Relaxation Category Dominates",
                "explanation": "In the synthetic dataset, Sleep & Relaxation products show the highest overall illustrative revenue.",
                "confidence": 0.9,
                "evidence_count": 6
            },
            {
                "number": 2,
                "headline": "Energy & Performance Momentum Rising",
                "explanation": "Energy products show high average momentum but have lower overall revenue, indicating potential growth.",
                "confidence": 0.85,
                "evidence_count": 6
            },
            {
                "number": 3,
                "headline": "AI Configuration Notice",
                "explanation": "Gemini AI is not configured. Add GEMINI_API_KEY to see dynamic insights extracted from the live database state.",
                "confidence": 1.0,
                "evidence_count": 0
            }
        ]

    prompt = f"Analyze the overall market context and extract exactly 3 high-impact executive insights.\n\nContext:\n{context}"

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=ExecutiveBriefResponse,
                temperature=0.3
            )
        )
        data = json.loads(response.text)
        return data.get("observations", [])
    except Exception as e:
        print(f"Gemini API error in generate_executive_summary: {e}")
        return [
            {
                "number": 1,
                "headline": "AI analysis is temporarily unavailable",
                "explanation": "The underlying market data remains fully accessible. Check backend logs for details.",
                "confidence": 0.0,
                "evidence_count": 0
            }
        ]

def analyze_product_classification(product_context: str) -> dict:
    """
    Analyzes product classification using a local keyword density matching logic.
    Bypasses Gemini API to ensure instant, quota-free responses.
    """
    category_keywords = {
        "Sleep & Relaxation": ["sleep", "melatonin", "relaxation", "somnus", "zzz", "valerian", "rest", "night", "calm", "evening", "dream"],
        "Energy & Performance": ["energy", "creatine", "performance", "sport", "workout", "stamina", "caffeine", "hydration", "electrolyte", "nitro", "power", "athletic"],
        "Immunity": ["immune", "zinc", "vitamin c", "elderberry", "cold", "defender", "ascorbic", "bronchial", "respiratory", "seasonal"],
        "Gut Health": ["probiotic", "acidophilus", "microbiome", "gut", "digestive", "enzyme", "laxative", "bloating", "regularity", "digest", "stomach"],
        "Cognitive Support": ["cognitive", "focus", "nootropic", "lion's mane", "memory", "brain", "concentration", "synapse", "alertness", "clarity"],
        "Stress & Mood": ["stress", "ashwagandha", "cortisol", "calm", "anxiety", "mood", "rhodiola", "serotonin", "5-htp", "relax"],
        "Beauty From Within": ["collagen", "biotin", "skin", "hair", "nail", "beauty", "keratin", "dermal", "elasticity", "glow"],
        "Healthy Aging": ["aging", "resveratrol", "longevity", "coq10", "nmn", "cell", "mitochondria", "repair", "antioxidant"]
    }
    
    text_pool = product_context.lower()
    
    category_matches = {}
    for cat_name, keywords in category_keywords.items():
        matches = 0
        for kw in keywords:
            if kw in text_pool:
                matches += 1
        category_matches[cat_name] = matches
        
    total_matches = sum(category_matches.values())
    
    if total_matches == 0:
        recommended_category = "Immunity"  # fallback default
        confidence = 0.70
        reasoning = (
            "Local Deterministic Analysis: No specific wellness keywords detected in product context. "
            "Recommending 'Immunity' as general baseline mapping. Reviewer auditing suggested."
        )
    else:
        best_category = max(category_matches, key=category_matches.get)
        best_matches = category_matches[best_category]
        
        confidence = best_matches / total_matches
        matched_kws = [kw for kw in category_keywords[best_category] if kw in text_pool]
        
        reasoning = (
            f"Local Deterministic Classifier: Identified category recommendation based on keyword density. "
            f"Matched {best_matches} primary indicator keywords for '{best_category}' ({', '.join(matched_kws)}). "
            f"Total matching keywords across all categories was {total_matches}."
        )
        recommended_category = best_category
        
    confidence = max(0.50, min(0.99, confidence))
    
    return {
        "recommended_category": recommended_category,
        "confidence": round(confidence, 2),
        "reasoning": reasoning,
        "suggested_claims_remapping": []
    }

def interpret_market_segment(category_context: str) -> dict:
    """
    Interprets a specific category segment, summarizing key drivers and opportunities.
    """
    if not client:
        return {
            "summary": "Gemini AI is not configured. Showing standard segment metrics.",
            "key_drivers": ["Seeded brand presence", "Attributed claim weights"],
            "growth_opportunities": ["Fill in GEMINI_API_KEY environment variable to activate detailed segment auditing."],
            "underrepresented_claims": ["Unsupervised claim detection"]
        }

    prompt = f"Interpret this market segment based on the top products, ingredients, and claims in the context.\n\nCategory Context:\n{category_context}"

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=SegmentInterpretationResponse,
                temperature=0.3
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini API error in interpret_market_segment: {e}")
        return {
            "summary": "AI analysis is temporarily unavailable.",
            "key_drivers": [],
            "growth_opportunities": [],
            "underrepresented_claims": []
        }

class PackagingExtractResponse(BaseModel):
    name: str = Field(description="The extracted product name")
    brand: str = Field(description="The brand/manufacturer name")
    category: str = Field(description="The recommended category mapping")
    claims: List[str] = Field(description="Cleaned, split list of health claims extracted from packaging")
    ingredients: List[str] = Field(description="Cleaned, split list of active ingredients extracted from packaging")

def ocr_extract_packaging_label(image_content: bytes, mime_type: str, filename: str) -> dict:
    """
    Simulates or calls Gemini to run OCR and computer vision on product packaging images.
    Cleans and splits the extracted claims and ingredients.
    """
    if not client:
        raise ValueError("Gemini API key is not configured. Label OCR scanning requires a valid GEMINI_API_KEY.")

    # Call Gemini Flash to run Computer Vision & OCR
    prompt = (
        "You are an expert supplement compliance auditor. Run OCR and computer vision on this product packaging image.\n"
        "1. Extract the product name, brand, recommended category (must be one of: Sleep & Relaxation, Energy & Performance, Immunity, Gut Health, Cognitive Support, Stress & Mood, Beauty From Within, Healthy Aging).\n"
        "2. Extract and clean the product claims (split them into short individual sentences, cleaning out promotional sentences like 'We guarantee it!').\n"
        "3. Extract the active ingredients list, cleaning out chemical additives or carriers (keep only active compounds, split them into list items).\n"
        "Return the output in structured JSON."
    )

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=image_content, mime_type=mime_type),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=PackagingExtractResponse,
                temperature=0.1
            )
        )
        data = json.loads(response.text)
        data["reasoning"] = f"Gemini 2.5 Computer Vision Ingestion: Extracted product details and claims directly from the packaging image."
        return data
    except Exception as e:
        print(f"Gemini OCR extraction failed: {e}")
        # Return fallback on exception
        return {
            "name": "Fallback Multi-Vitamin",
            "brand": "Standard Catalog",
            "category": "Immunity",
            "claims": ["Supports general health and daily immune functions."],
            "ingredients": ["Vitamin C", "Vitamin D"],
            "reasoning": f"OCR Ingestion Error: {str(e)}. Defaulted to fallback mapping."
        }
