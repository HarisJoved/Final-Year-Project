from fastapi import APIRouter, Depends, HTTPException, status
from ..database import get_database
from ..models import UserResponse, UserUpdate
from ..auth import get_current_user, get_password_hash
from bson import ObjectId


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: UserResponse = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db=Depends(get_database)
):
    update_data = {}
    
    if user_update.username is not None:
        # Check if username is already taken by another user
        existing_user = await db.users.find_one({
            "username": user_update.username,
            "_id": {"$ne": ObjectId(current_user.id)}
        })
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        update_data["username"] = user_update.username
    
    if user_update.email is not None:
        # Check if email is already taken by another user
        existing_user = await db.users.find_one({
            "email": user_update.email,
            "_id": {"$ne": ObjectId(current_user.id)}
        })
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        update_data["email"] = user_update.email
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields provided for update"
        )
    
    # Update user in database
    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    # Return updated user
    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    return UserResponse(**updated_user)
