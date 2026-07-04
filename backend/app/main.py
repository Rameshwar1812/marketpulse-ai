import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import engine, Base, SessionLocal, get_db
from app.config import settings
from app.seed import seed_database
from app.routers import auth, dashboard, market, products, chat, reviews, audit, sources

# Create database tables (SQLite will create file if it doesn't exist)
Base.metadata.create_all(bind=engine)

# Auto seed disabled to allow clean analyst signup testing
# db = SessionLocal()
# try:
#     seed_database(db)
# finally:
#     db.close()

app = FastAPI(
    title="MarketPulse AI API",
    description="AI-Powered Market Product Trend Assistant Backend",
    version="1.0.0"
)

# CORS configurations
# Allow frontend access
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(market.router)
app.include_router(products.router)
app.include_router(chat.router)
app.include_router(reviews.router)
app.include_router(audit.router)
app.include_router(sources.router)

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Standard health endpoint. Checks database connection and reports configuration.
    Does not call Gemini or perform heavy checks.
    """
    try:
        # Perform light test query
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    gemini_configured = bool(settings.GEMINI_API_KEY)

    status_code = 200
    if db_status != "connected":
        status_code = 500

    return {
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
        "gemini_configured": gemini_configured
    }

@app.get("/")
def read_root():
    return {"message": "MarketPulse AI Backend API is running."}
