from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Annotated, Dict
from datetime import datetime
from bson import ObjectId


def validate_object_id(v) -> ObjectId:
    if not ObjectId.is_valid(v):
        raise ValueError("Invalid objectid")
    return ObjectId(v)


PyObjectId = Annotated[ObjectId, Field(description="MongoDB ObjectId")]


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    username: str
    email: EmailStr
    created_at: datetime

    @field_validator('id', mode='before')
    @classmethod
    def validate_id(cls, v):
        return validate_object_id(v)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class DocumentCreate(BaseModel):
    original_text: str
    corrected_text: Optional[str] = None


class DocumentUpdate(BaseModel):
    corrected_text: str


class DocumentResponse(BaseModel):
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
    user_id: PyObjectId
    original_text: str
    corrected_text: Optional[str] = None
    created_at: datetime

    @field_validator('id', 'user_id', mode='before')
    @classmethod
    def validate_object_ids(cls, v):
        return validate_object_id(v)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class PreprocessingOptions(BaseModel):
    rotation: int = 0  # 0, 90, 180, 270 degrees
    crop: Optional[Dict[str, int]] = None  # {x, y, width, height}
    grayscale: bool = False
    enhance_contrast: bool = False


class OCRResponse(BaseModel):
    extracted_text: str
    processed_preview: Optional[str] = None
    original_size: Optional[tuple] = None
    processed_size: Optional[tuple] = None
