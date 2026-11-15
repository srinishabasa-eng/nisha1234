
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, Date
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel, Field
from typing import Literal
from datetime import date
import os
from datetime import datetime, timedelta, timezone
from pwdlib import PasswordHash
import jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# Authentication settings
SECRET_KEY = "S1R2N3"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
# Database configuration
DATABASE_URL = "sqlite:///./expenses.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# Database table
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    type = Column(String, nullable=False)
    transaction_date = Column(Date, nullable=False)
    note = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
# Create database tables
Base.metadata.create_all(bind=engine)

# FastAPI application
app = FastAPI(
    title="Monthly Expenses Tracker API",
    description="Backend API for managing income and expenses",
    version="1.0.0"
)

# Allow frontend connection during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request model
class TransactionCreate(BaseModel):
    title: str
    amount: float = Field(gt=0)
    category: str
    type: Literal["income", "expense"]
    transaction_date: date
    note: str = ""


# Database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Home API
@app.get("/")
def home():
    return {
        "message": "Monthly Expenses Tracker API is running!"
    }


# Add transaction
@app.post("/transactions")
def add_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db)
):
    transaction = Transaction(**data.model_dump())

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


# Get all transactions
@app.get("/transactions")
def get_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).order_by(
        Transaction.transaction_date.desc()
    ).all()


# Update transaction
@app.put("/transactions/{transaction_id}")
def update_transaction(
    transaction_id: int,
    data: TransactionCreate,
    db: Session = Depends(get_db)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    for key, value in data.model_dump().items():
        setattr(transaction, key, value)

    db.commit()
    db.refresh(transaction)

    return transaction


# Delete transaction
@app.delete("/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    db.delete(transaction)
    db.commit()

    return {"message": "Transaction deleted successfully"}


# Dashboard summary
@app.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).all()

    income = sum(
        t.amount for t in transactions if t.type == "income"
    )

    expenses = sum(
        t.amount for t in transactions if t.type == "expense"
    )

    return {
        "total_income": income,
        "total_expenses": expenses,
        "balance": income - expenses
    }
# Registration request model
class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str


# Login request model
class LoginRequest(BaseModel):
    email: str
    password: str


# Create access token
def create_access_token(user_id: int):
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# Register API
@app.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == data.email.lower()
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters"
        )

    user = User(
        full_name=data.full_name,
        email=data.email.lower(),
        hashed_password=password_hash.hash(data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Registration successful",
        "user_id": user.id
    }


# Login API
@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email == data.email.lower()
    ).first()

    if not user or not password_hash.verify(
        data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(user.id)

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "full_name": user.full_name
    }


# Change Password Request
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# Verify logged-in user using JWT token
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        user_id = int(payload.get("sub"))

    except (jwt.InvalidTokenError, TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


# Change Password API
@app.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not password_hash.verify(
        data.current_password,
        current_user.hashed_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must contain at least 8 characters"
        )

    if data.current_password == data.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different"
        )

    current_user.hashed_password = password_hash.hash(
        data.new_password
    )

    db.commit()

    return {"message": "Password changed successfully"}


@app.post("/token")
def login_for_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == form_data.username.lower()
    ).first()

    if not user or not password_hash.verify(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
