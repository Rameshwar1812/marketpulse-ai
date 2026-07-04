from app.database import SessionLocal
from app.models import User, Category, Source
from app.services.auth_service import hash_password
from sqlalchemy import text

def clear_and_seed_baseline():
    db = SessionLocal()
    
    print("Clearing all tables via TRUNCATE CASCADE...")
    try:
        db.execute(text(
            "TRUNCATE TABLE product_ingredients, evidence, claims, reviews, "
            "audit_logs, products, ingredients, brands, sources, categories, users CASCADE;"
        ))
        db.commit()
        print("All tables cleared successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error clearing tables: {e}")
        db.close()
        return
    
    print("Seeding default user accounts...")
    users = [
        User(
            full_name="Rajesh Kumar",
            email="rajesh.kumar@marketpulse.demo",
            hashed_password=hash_password("DemoPass123!"),
            role="executive",
            is_active=True
        ),
        User(
            full_name="Aarav Sharma",
            email="aarav.sharma@marketpulse.demo",
            hashed_password=hash_password("DemoPass123!"),
            role="analyst",
            is_active=True
        ),
        User(
            full_name="Priya Patel",
            email="priya.patel@marketpulse.demo",
            hashed_password=hash_password("DemoPass123!"),
            role="reviewer",
            is_active=True
        ),
        User(
            full_name="Amit Singh",
            email="admin@marketpulse.demo",
            hashed_password=hash_password("DemoPass123!"),
            role="admin",
            is_active=True
        )
    ]
    db.add_all(users)
    db.commit()
    
    print("Seeding 8 standard product categories...")
    category_list = [
        ("Sleep & Relaxation", "Products formulated to promote restful sleep, reduce latency, and improve sleep cycles."),
        ("Energy & Performance", "Supplements targeted at improving athletic performance, stamina, physical energy, and focus."),
        ("Immunity", "Formulas built to reinforce natural immune defenses and respiratory health."),
        ("Gut Health", "Probiotics, prebiotics, and enzymes focused on digestion, microbiome health, and bloating."),
        ("Cognitive Support", "Nootropics for memory enhancement, mental clarity, alertness, and neural longevity."),
        ("Stress & Mood", "Adaptogens and nutrients designed to modulate cortisol and support emotional resilience."),
        ("Beauty From Within", "Ingredients targeting skin elasticity, hair growth, nail strength, and collagen synthesis."),
        ("Healthy Aging", "Antioxidants, NAD+ boosters, and longevity compounds supporting cellular maintenance.")
    ]
    for name, desc in category_list:
        db.add(Category(name=name, description=desc))
    db.commit()
    
    print("Seeding active ingestion sources...")
    source_list = [
        Source(name="Third-Party Market Ingestion Service", source_type="Market Report", reference="SPINS/IRI Market Report 2026", collection_method="API Sync", status="Active", data_quality_score=0.95),
        Source(name="Retailer Product Database Ingestion", source_type="Retailer Page", reference="Fictional E-Commerce Platform", collection_method="Web Scraping", status="Active", data_quality_score=0.88),
        Source(name="Manual Document Upload Workspace", source_type="Manual Upload", reference="Analyst PDF Upload", collection_method="File Ingest", status="Active", data_quality_score=0.90),
        Source(name="AI OCR Label Scanner", source_type="Packaging Images", reference="Packaging Capture Module", collection_method="Mobile Scan", status="Active", data_quality_score=0.82)
    ]
    db.add_all(source_list)
    db.commit()
    
    print("Success! Database cleared and baseline user accounts successfully seeded.")
    db.close()

if __name__ == "__main__":
    clear_and_seed_baseline()
