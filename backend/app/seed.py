import random
import datetime
from sqlalchemy.orm import Session
from app.models import User, Category, Brand, Source, Product, Claim, Ingredient, ProductIngredient, Evidence, Review, AuditLog
from app.services.auth_service import hash_password

def seed_database(db: Session):
    # Check if database is already seeded
    if db.query(User).first() is not None:
        print("Database already contains data. Skipping seeding.")
        return

    print("Seeding database...")

    # 1. Seed Users
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

    # 2. Seed Categories
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
    
    categories = []
    for name, desc in category_list:
        cat = Category(name=name, description=desc)
        db.add(cat)
        categories.append(cat)
    db.commit()

    # 3. Seed Brands
    brand_names = [
        ("Northstar Wellness", "Premium Organic"),
        ("VitaForge", "Sports Performance & Nutrition"),
        ("WellSpring Labs", "Clinical Strength & Bioactive"),
        ("CoreBloom Nutrition", "Daily Whole Foods & Botanicals"),
        ("Elevate Health Co.", "Modern Active Lifestyle"),
        ("Nurtura", "Traditional & Integrative Health"),
        ("BrightPath Wellness", "Family & Targeted Support"),
        ("EverPeak Nutrition", "High-Altitude Athletic Supplements")
    ]
    
    brands = []
    for name, segment in brand_names:
        b = Brand(name=name, market_segment=segment)
        db.add(b)
        brands.append(b)
    db.commit()

    # 4. Seed Sources
    source_list = [
        Source(name="Third-Party Market Ingestion Service", source_type="Market Report", reference="SPINS/IRI Market Report 2026", collection_method="API Sync", status="Active", data_quality_score=0.95),
        Source(name="Retailer Product Database Ingestion", source_type="Retailer Page", reference="Fictional E-Commerce Platform", collection_method="Web Scraping", status="Active", data_quality_score=0.88),
        Source(name="Manual Document Upload Workspace", source_type="Manual Upload", reference="Analyst PDF Upload", collection_method="File Ingest", status="Active", data_quality_score=0.90),
        Source(name="AI OCR Label Scanner", source_type="Packaging Images", reference="Packaging Capture Module", collection_method="Mobile Scan", status="Active", data_quality_score=0.82)
    ]
    db.add_all(source_list)
    db.commit()

    # 5. Seed Ingredients
    ingredients_data = {
        "Sleep & Relaxation": [
            ("Magnesium Bisglycinate", "Highly bioavailable form of magnesium supporting muscle relaxation and deep sleep."),
            ("Melatonin", "Hormone naturally produced to signal and regulate sleep-wake cycles."),
            ("L-Theanine", "Amino acid promoting relaxation without drowsiness, synergistic with cognitive agents."),
            ("Valerian Root", "Traditional herbal extract known for sedative and anxiety-reducing properties.")
        ],
        "Energy & Performance": [
            ("Creatine Monohydrate", "Supports ATP regeneration, muscle size, and strength output."),
            ("Electrolyte Complex", "Sodium, potassium, and magnesium blend for hydration recovery."),
            ("B-Complex Vitamins", "Coenzymes essential for cellular energy production and nervous system health."),
            ("Caffeine Anhydrous", "Central nervous system stimulant for immediate alertness and workout power.")
        ],
        "Immunity": [
            ("Vitamin C (Ascorbic Acid)", "Potent antioxidant supporting white blood cell production and function."),
            ("Zinc Picolinate", "Mineral critical for immune cell development and defense signaling."),
            ("Elderberry Extract", "Berry extract high in anthocyanins, traditionally used to shorten cold symptoms."),
            ("Vitamin D3", "Hormone precursor regulating adaptive and innate immune responses.")
        ],
        "Gut Health": [
            ("Lactobacillus acidophilus", "Probiotic strain supporting lactose digestion and vaginal/gut flora."),
            ("Bifidobacterium lactis", "Probiotic strain associated with improved digestion and stool consistency."),
            ("Prebiotic Inulin", "Soluble fiber source that selectively feeds beneficial gut microbes."),
            ("Digestive Enzyme Blend", "Protease, amylase, and lipase helping breakdown macronutrients.")
        ],
        "Cognitive Support": [
            ("Lion's Mane Mushroom", "Fungal extract promoting nerve growth factor (NGF) and memory recall."),
            ("Alpha-GPC", "Choline source crossing the blood-brain barrier to support acetylcholine synthesis."),
            ("Bacopa Monnieri", "Adaptogenic herb supporting synaptic communication and learning retention."),
            ("Ginkgo Biloba", "Botanical enhancing cerebral blood flow and antioxidant protection.")
        ],
        "Stress & Mood": [
            ("Ashwagandha Extract (KSM-66)", "Adaptogen clinical proven to lower cortisol and perceived anxiety."),
            ("Rhodiola Rosea", "Botanical adaptogen reducing fatigue under stress and supporting mood."),
            ("5-HTP", "Serotonin precursor supporting emotional stability and calm."),
            ("Magnesium L-Threonate", "Magnesium crossing blood-brain barrier to support stress resilience.")
        ],
        "Beauty From Within": [
            ("Hydrolyzed Collagen", "Bioactive peptides supporting skin elasticity, moisture, and joint health."),
            ("Biotin", "Vitamin B7 involved in keratin structure, supporting hair and nail growth."),
            ("Hyaluronic Acid", "Glycosaminoglycan retaining skin moisture and lubrication."),
            ("Ceramides", "Lipids forming skin barrier to lock in moisture and protect from pollutants.")
        ],
        "Healthy Aging": [
            ("Resveratrol", "Polyphenol activating sirtuin longevity pathways and cellular health."),
            ("Coenzyme Q10 (CoQ10)", "Antioxidant vital for mitochondrial energy production and cardiovascular health."),
            ("NMN (Nicotinamide Mononucleotide)", "Direct precursor to NAD+ boosting cellular repair and metabolism."),
            ("Astragalus Root", "Herb supporting telomere integrity and immune longevity.")
        ]
    }

    all_ingredients = {}
    for cat_name, ing_list in ingredients_data.items():
        for ing_name, ing_desc in ing_list:
            if ing_name not in all_ingredients:
                ing = Ingredient(name=ing_name, description=ing_desc)
                db.add(ing)
                all_ingredients[ing_name] = ing
    db.commit()

    # Helper function to generate fictional products
    product_templates = {
        "Sleep & Relaxation": [
            {"suffix": "Deep Sleep Formula", "claims": ["Promotes restful deep sleep", "Reduces sleep latency", "Supports natural circadian rhythms", "Relaxes muscles"]},
            {"suffix": "Night Rest Complex", "claims": ["Supports calm evening wind-down", "Improves overall sleep quality", "Wake up feeling refreshed"]},
            {"suffix": "Somnus PM", "claims": ["Enhances REM sleep duration", "Non-habit forming relaxation", "Reduces nighttime waking"]},
            {"suffix": "DreamState", "claims": ["Promotes vivid dreaming states", "Accelerates mental decompression", "Soothes daily muscle tension"]},
            {"suffix": "Restful ZZZs", "claims": ["Supports fast acting relaxation", "Regulates sleep-wake cycles", "Buffers evening stress response"]},
            {"suffix": "Lunar Sleep Melt", "claims": ["Fast dissolving sleep signal", "Supports restful recovery cycles", "Eases physical restlessness"]}
        ],
        "Energy & Performance": [
            {"suffix": "Pre-Workout Ignite", "claims": ["Boosts muscular power output", "Delays fatigue onset", "Enhances physical stamina", "Provides sustained clean energy"]},
            {"suffix": "Hydration Fuel", "claims": ["Restores critical electrolytes", "Supports cellular hydration", "Prevents muscle cramping"]},
            {"suffix": "ATP Booster", "claims": ["Enhances cellular ATP pathways", "Supports quick power recovery", "Improves high-intensity performance"]},
            {"suffix": "Apex Energy", "claims": ["Promotes sharp athletic focus", "Ignites metabolic activity", "Accelerates physical recovery"]},
            {"suffix": "Velo Stamina", "claims": ["Optimizes aerobic capacity", "Reduces exercise-induced soreness", "Supports heart health under strain"]},
            {"suffix": "Nitro Surge", "claims": ["Supports nitric oxide blood flow", "Improves muscular pumps", "Enhances cellular oxygenation"]}
        ],
        "Immunity": [
            {"suffix": "Immune Shield", "claims": ["Strengthens natural immune defenses", "Supports respiratory health", "Provides antioxidant protection", "Reinforces cellular barrier"]},
            {"suffix": "Elderberry Defense", "claims": ["Standardized immune reinforcement", "Soothes seasonal throat discomfort", "Rich in active anthocyanins"]},
            {"suffix": "Zinc-C Daily", "claims": ["Provides core seasonal mineral defense", "Optimizes cellular immune response", "Combats oxidative stressors"]},
            {"suffix": "Defender 360", "claims": ["Full-spectrum immune resilience", "Supports seasonal wellness transitions", "Enhances white blood cell function"]},
            {"suffix": "Immuno-Max Bioactive", "claims": ["Bioactive nutrient immune primers", "Supports mucosal immunity layers", "Supports rapid response defense"]},
            {"suffix": "Sentinel Wellness", "claims": ["Maintains year-round systemic immunity", "Aids lymphatic clearance", "Protects against environmental stresses"]}
        ],
        "Gut Health": [
            {"suffix": "Probiotic Daily Core", "claims": ["Supports digestive regularity", "Replenishes beneficial gut flora", "Relieves occasional bloating", "Strengthens gut lining"]},
            {"suffix": "Microbiome Restructure", "claims": ["Clinically backed flora colonization", "Supports digestive immune integrity", "Improves nutrient absorption"]},
            {"suffix": "Enzyme Balance", "claims": ["Breaks down difficult macronutrients", "Reduces post-meal heaviness", "Optimizes metabolic digestion"]},
            {"suffix": "Prebiotic Fuel", "claims": ["Feeds beneficial gut bacteria", "Supports short-chain fatty acids", "Promotes gut-brain communication"]},
            {"suffix": "Flora-Restore 50B", "claims": ["Super-potency microbiome seeders", "Rebalances flora after disruptions", "Supports bowel comfort"]},
            {"suffix": "Gut Barrier Shield", "claims": ["Protects intestinal permeability", "Supports tight junction health", "Calms intestinal inflammation"]}
        ],
        "Cognitive Support": [
            {"suffix": "Focus Nootropic", "claims": ["Enhances memory and recall", "Promotes sharp mental clarity", "Supports sustained concentration", "Protects neurons from stress"]},
            {"suffix": "Lion's Recall", "claims": ["Stimulates nerve growth factors", "Supports synaptic plasticity", "Improves verbal fluency"]},
            {"suffix": "Neuro-Clarity PM", "claims": ["Recharges cognitive pathways overnight", "Protects against mental fatigue", "Soothes high-stress brain state"]},
            {"suffix": "Synapse Spark", "claims": ["Accelerates neuro-transmission speed", "Supports flow state induction", "Enhances multitasking stamina"]},
            {"suffix": "Zenith Focus", "claims": ["Promotes alert tranquility", "Sharpens attention span", "Supports cognitive reaction time"]},
            {"suffix": "Brain-Armor Active", "claims": ["Combats age-related cognitive decline", "Supports cerebral microcirculation", "Provides deep neural antioxidants"]}
        ],
        "Stress & Mood": [
            {"suffix": "Cortisol Calm", "claims": ["Reduces stress and cortisol levels", "Supports emotional stability", "Promotes calm resilience", "Improves daily mood"]},
            {"suffix": "Rhodiola Rise", "claims": ["Combats stress-related fatigue", "Supports daily mood elevation", "Enhances mental stamina"]},
            {"suffix": "5-HTP Serotonin Support", "claims": ["Precursor to positive mood", "Regulates emotional balance", "Promotes gentle relaxation"]},
            {"suffix": "Equilibrium Adaptogen", "claims": ["Balances systemic stress response", "Protects adrenal reserve capacity", "Calms overactive sympathetic system"]},
            {"suffix": "Adrenal Restore", "claims": ["Replenishes depleted stress buffers", "Supports physical stress recovery", "Harmonizes neuro-endocrine pathways"]},
            {"suffix": "Mood-Lift Bioactive", "claims": ["Supports dopamine & serotonin pathways", "Reduces feelings of burnout", "Promotes optimistic state"]}
        ],
        "Beauty From Within": [
            {"suffix": "Collagen Elixir", "claims": ["Improves skin elasticity", "Reduces fine line appearance", "Supports joint and cartilage strength", "Locks in deep skin moisture"]},
            {"suffix": "Keratin Glow", "claims": ["Supports thick hair follicle growth", "Strengthens brittle nail beds", "Provides structure to dermal cells"]},
            {"suffix": "Hydra-Derm Infusion", "claims": ["Promotes skin cell water retention", "Restores youthful skin volume", "Supports dermal barrier integrity"]},
            {"suffix": "Dermal Barrier Support", "claims": ["Fortifies skin lipid structures", "Protects against UV photo-aging", "Calms skin redness and irritation"]},
            {"suffix": "Biotin Shield", "claims": ["Supplies cellular building blocks for hair", "Accelerates nail growth rate", "Supports fatty acid metabolism in skin"]},
            {"suffix": "Lumino Skin Radiance", "claims": ["Promotes bright skin tone", "Regulates cellular turnover", "Neutralizes skin aging free radicals"]}
        ],
        "Healthy Aging": [
            {"suffix": "NAD+ Resurrect", "claims": ["Boosts cellular repair processes", "Supports mitochondrial function", "Increases cellular NAD+ levels", "Combats biological aging signals"]},
            {"suffix": "Resveratrol Gold", "claims": ["Activates longevity pathways (Sirtuins)", "Provides comprehensive cardiovascular defense", "Fights systemic cell oxidation"]},
            {"suffix": "Longevity Complex", "claims": ["Maintains chromosome telomere health", "Supports deep cellular energy", "Reinforces DNA replication integrity"]},
            {"suffix": "Cell-Restore CoQ10", "claims": ["Optimizes heart muscle energy", "Fights age-related cellular decline", "Recycles other cellular antioxidants"]},
            {"suffix": "Telomere Defense", "claims": ["Slows biological cellular aging", "Maintains cellular regeneration capacity", "Supports healthy chromosomal structure"]},
            {"suffix": "Mito-Vitality Prime", "claims": ["Recharges declining mitochondria", "Enhances systemic cellular efficiency", "Protects nerve & organ tissues"]}
        ]
    }

    # Track sku list to prevent duplicates
    generated_skus = set()

    product_count = 0
    # Seed 48 Products (6 per category, 8 categories)
    for cat in categories:
        templates = product_templates[cat.name]
        
        # Select matching ingredients for this category
        cat_ingredients = ingredients_data[cat.name]
        
        for i, temp in enumerate(templates):
            # Pick a brand
            brand = brands[(product_count) % len(brands)]
            
            # Generate unique SKU
            sku_prefix = "".join([c for c in cat.name if c.isupper()])
            sku_num = 100 + product_count
            sku = f"MP-{sku_prefix}-{sku_num}"
            
            product_count += 1
            
            # Determine revenue and momentum
            # Some deliberate cross-positioning patterns: e.g. Sleep & Cognitive overlap, Performance & Gut Health
            revenue = float(random.randint(150000, 3500000))
            momentum = float(round(random.uniform(0.1, 9.9), 1))
            
            # Set a low confidence/pending review on ~10% of products to test reviewing
            is_pending = (product_count % 8 == 0)
            is_overridden = (product_count % 13 == 0)
            
            if is_pending:
                ai_confidence = float(round(random.uniform(0.40, 0.69), 2))
                review_status = "pending"
            elif is_overridden:
                ai_confidence = float(round(random.uniform(0.70, 0.85), 2))
                review_status = "overridden"
            else:
                ai_confidence = float(round(random.uniform(0.85, 0.99), 2))
                review_status = "approved"

            p = Product(
                name=f"{brand.name} {temp['suffix']}",
                sku=sku,
                brand_id=brand.id,
                category_id=cat.id,
                description=f"Advanced dietary supplement formulated by {brand.name} to optimize health indices within the {cat.name} domain.",
                illustrative_revenue=revenue,
                momentum_score=momentum,
                ai_confidence=ai_confidence,
                review_status=review_status,
                source_id=random.choice(source_list).id
            )
            db.add(p)
            db.flush() # Gain ID

            # 6. Seed Claims for this product
            # Assign weights that sum to 1.0
            num_claims = len(temp["claims"])
            weights = []
            if num_claims == 1:
                weights = [1.0]
            else:
                # generate random weights that sum to 1.0
                raw_weights = [random.randint(10, 50) for _ in range(num_claims)]
                total_w = sum(raw_weights)
                weights = [round(w / total_w, 2) for w in raw_weights]
                # fix float summation rounding error
                weights[-1] = round(1.0 - sum(weights[:-1]), 2)
            
            for c_idx, claim_text in enumerate(temp["claims"]):
                c = Claim(
                    product_id=p.id,
                    raw_text=f"Clinically formulated: {claim_text}.",
                    normalized_claim=claim_text,
                    category_id=cat.id,
                    confidence=float(round(random.uniform(0.75, 0.99), 2)),
                    weight=weights[c_idx]
                )
                db.add(c)

            # 7. Seed Ingredients mapping (1-4 ingredients)
            # Ensure at least 1 hero ingredient matching our category
            num_ings = random.randint(1, 4)
            chosen_ings = random.sample(cat_ingredients, min(num_ings, len(cat_ingredients)))
            
            # Cross-positioning: inject L-Theanine into Energy products, Magnesium into Cognitive products, etc.
            if cat.name == "Energy & Performance" and random.choice([True, False]):
                chosen_ings.append(("L-Theanine", "")) # relaxation cognitive
            if cat.name == "Cognitive Support" and random.choice([True, False]):
                chosen_ings.append(("Magnesium Bisglycinate", "")) # sleep stress

            for ing_idx, ing_item in enumerate(chosen_ings):
                ing_name = ing_item[0]
                db_ing = all_ingredients[ing_name]
                
                # First ingredient is always hero
                is_hero = (ing_idx == 0)
                dosage = f"{random.choice([50, 100, 250, 500])}mg"
                
                pi = ProductIngredient(
                    product_id=p.id,
                    ingredient_id=db_ing.id,
                    dosage=dosage,
                    is_hero=is_hero,
                    confidence=float(round(random.uniform(0.80, 0.99), 2))
                )
                db.add(pi)

            # 8. Seed Evidence (1-2 records)
            ev = Evidence(
                product_id=p.id,
                evidence_type=random.choice(["Label", "Study", "Third Party"]),
                description=f"Extracted claims from packaging scan of {p.name}. Verified active dosage of {chosen_ings[0][0]}.",
                source_id=p.source_id,
                confidence=float(round(random.uniform(0.70, 0.99), 2))
            )
            db.add(ev)

            # 9. Seed Review queue records if pending/overridden
            if is_pending:
                r = Review(
                    product_id=p.id,
                    status="pending",
                    reason_flagged="Low classification confidence (claim mapping threshold under 0.65).",
                    ai_recommendation=f"Reclassify from {cat.name} to Stress & Mood (due to high L-Theanine concentration).",
                    ai_confidence=0.55,
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(1, 10))
                )
                db.add(r)
            elif is_overridden:
                # Add historical overridden record
                r = Review(
                    product_id=p.id,
                    status="overridden",
                    reason_flagged="Ambiguous ingredients mapping (Sleep vs Stress).",
                    ai_recommendation="Sleep & Relaxation",
                    ai_confidence=0.72,
                    reviewer_decision="overridden",
                    reviewer_name="Compliance Reviewer",
                    reviewer_reason="Product primarily marketed for daily stress release, not sleep support.",
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(days=12),
                    resolved_at=datetime.datetime.utcnow() - datetime.timedelta(days=11)
                )
                db.add(r)
                
                # Add Audit Log for override
                aud = AuditLog(
                    entity_type="product",
                    entity_id=p.id,
                    action="override_classification",
                    previous_value="Sleep & Relaxation",
                    new_value="Stress & Mood",
                    reason="Product primarily marketed for daily stress release, not sleep support.",
                    user_name="Compliance Reviewer",
                    model_name="gemini-2.5-flash",
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(days=11)
                )
                db.add(aud)

    db.commit()
    print("Database seeding completed successfully.")
