from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from ..database import get_database
from ..models import DocumentResponse, DocumentCreate, DocumentUpdate, UserResponse, OCRResponse
from ..auth import get_current_user
from ..services.ocr_service import OCRService
from bson import ObjectId


router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload-image", response_model=OCRResponse)
async def upload_and_process_image(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Read file contents
    image_bytes = await file.read()
    
    # Process image with OCR
    extracted_text = await OCRService.extract_text_from_image(image_bytes)
    
    return OCRResponse(extracted_text=extracted_text)


@router.post("/", response_model=DocumentResponse)
async def create_document(
    document_data: DocumentCreate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    document_doc = {
        "user_id": ObjectId(current_user.id),
        "original_text": document_data.original_text,
        "corrected_text": document_data.corrected_text,
        "created_at": datetime.utcnow()
    }
    
    result = await db.documents.insert_one(document_doc)
    document_doc["_id"] = result.inserted_id
    
    return DocumentResponse(**document_doc)


@router.get("/", response_model=List[DocumentResponse])
async def get_user_documents(
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    documents = []
    async for doc in db.documents.find({"user_id": ObjectId(current_user.id)}).sort("created_at", -1):
        documents.append(DocumentResponse(**doc))
    
    return documents


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    if not ObjectId.is_valid(document_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document ID"
        )
    
    document = await db.documents.find_one({
        "_id": ObjectId(document_id),
        "user_id": ObjectId(current_user.id)
    })
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return DocumentResponse(**document)


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: str,
    document_update: DocumentUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    if not ObjectId.is_valid(document_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document ID"
        )
    
    # Check if document exists and belongs to user
    existing_doc = await db.documents.find_one({
        "_id": ObjectId(document_id),
        "user_id": ObjectId(current_user.id)
    })
    
    if not existing_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Update document
    await db.documents.update_one(
        {"_id": ObjectId(document_id)},
        {"$set": {"corrected_text": document_update.corrected_text}}
    )
    
    # Return updated document
    updated_doc = await db.documents.find_one({"_id": ObjectId(document_id)})
    return DocumentResponse(**updated_doc)


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    if not ObjectId.is_valid(document_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document ID"
        )
    
    # Check if document exists and belongs to user
    existing_doc = await db.documents.find_one({
        "_id": ObjectId(document_id),
        "user_id": ObjectId(current_user.id)
    })
    
    if not existing_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete document
    await db.documents.delete_one({"_id": ObjectId(document_id)})
    
    return {"message": "Document deleted successfully"}
