from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, Token, UserResponse
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check duplicate email
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # For prototype registration, default role is analyst unless specified
    new_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        role=user_in.role if user_in.role in ["executive", "analyst", "reviewer", "admin"] else "analyst",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create access token
    access_token = create_access_token(data={"email": new_user.email, "role": new_user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive account.")

    # Update last login
    import datetime
    user.last_login = datetime.datetime.utcnow()
    db.commit()

    access_token = create_access_token(data={"email": user.email, "role": user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
