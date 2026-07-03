import datetime
import jwt
from pwdlib import PasswordHash
from pwdlib.exceptions import VerifyMismatchError
from app.config import settings

# Initialize password hash
password_hash = PasswordHash.recommended()

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return password_hash.verify(plain_password, hashed_password)
    except VerifyMismatchError:
        return False

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    try:
        decoded = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return decoded
    except jwt.PyJWTError:
        return {}
