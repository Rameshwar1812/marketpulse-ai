from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import decode_access_token
from app.models import User

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # Retrieve JWT from HTTP cookies
    token = request.cookies.get("access_token")
    
    # Fallback to Authorization header if cookies are disabled/missing
    if not token:
        authorization = request.headers.get("Authorization")
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]

    if not token:
        raise credentials_exception
        
    payload = decode_access_token(token)
    email = payload.get("email")
    if email is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)):
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action forbidden for role '{current_user.role}'. Required roles: {self.allowed_roles}"
            )
        return current_user
