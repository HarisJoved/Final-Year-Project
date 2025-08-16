from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import connect_to_mongo, close_mongo_connection
from .routers import auth, users, documents


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="Handwriting OCR API",
    description="A FastAPI application for handwriting OCR with user authentication",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(documents.router)


@app.get("/")
async def root():
    return {"message": "Handwriting OCR API is running!"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
