from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.models.homepage import HomepageContent, HomepageContentUpdate
from datetime import datetime
from typing import Optional
import uuid
import base64
import os
import aiofiles
from pathlib import Path

router = APIRouter(prefix="/api/homepage", tags=["homepage"])

# Create uploads directory
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# This would normally be imported from auth, but for now we'll use a simple dependency
async def get_admin_user():
    # In a real implementation, this would check authentication
    return {"user_id": "admin", "is_admin": True}

def get_database():
    from backend.server import database
    return database

@router.get("/content", response_model=HomepageContent)
async def get_homepage_content(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get the current homepage content.
    Returns default content if none exists.
    """
    try:
        # Try to get existing content
        content = await db.homepage_content.find_one({"id": "main"})
        
        if content:
            # Convert MongoDB document to Pydantic model
            content["_id"] = str(content["_id"])
            return HomepageContent(**content)
        else:
            # Return default content
            default_content = HomepageContent(id="main")
            return default_content
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving homepage content: {str(e)}"
        )

@router.put("/content", response_model=HomepageContent)
async def update_homepage_content(
    content_update: HomepageContentUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_admin_user)
):
    """
    Update homepage content. Only accessible to admin users.
    """
    try:
        # Get existing content or create default
        existing_content = await db.homepage_content.find_one({"id": "main"})
        
        if existing_content:
            # Update existing content
            current_content = HomepageContent(**existing_content)
        else:
            # Create new default content
            current_content = HomepageContent(id="main")
        
        # Update fields that are provided
        update_data = content_update.dict(exclude_unset=True)
        
        if "hero" in update_data:
            current_content.hero = content_update.hero
        if "features" in update_data:
            current_content.features = content_update.features
        if "testimonials" in update_data:
            current_content.testimonials = content_update.testimonials
        if "demo_items" in update_data:
            current_content.demo_items = content_update.demo_items
        
        # Update timestamp
        current_content.updated_at = datetime.now()
        
        # Save to database
        content_dict = current_content.dict()
        await db.homepage_content.update_one(
            {"id": "main"},
            {"$set": content_dict},
            upsert=True
        )
        
        return current_content
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating homepage content: {str(e)}"
        )

@router.post("/content/reset", response_model=HomepageContent)
async def reset_homepage_content(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Reset homepage content to default values.
    """
    try:
        # Create default content
        default_content = HomepageContent(id="main")
        
        # Save to database
        content_dict = default_content.dict()
        await db.homepage_content.update_one(
            {"id": "main"},
            {"$set": content_dict},
            upsert=True
        )
        
        return default_content
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error resetting homepage content: {str(e)}"
        )

@router.get("/content/preview", response_model=HomepageContent)
async def preview_homepage_content(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get homepage content for preview (public endpoint).
    """
    return await get_homepage_content(db)

@router.post("/upload/hero")
async def upload_hero_image(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Upload hero image/splat/ply for homepage.
    Supports files up to 200MB.
    """
    try:
        # Check file size (200MB limit)
        MAX_SIZE = 200 * 1024 * 1024  # 200MB in bytes
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > MAX_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size ({file_size / (1024*1024):.1f}MB) exceeds maximum allowed size of 200MB"
            )
        
        # Determine file type and set appropriate MIME type
        if file.filename and file.filename.endswith('.splat'):
            # For .splat files
            base64_content = base64.b64encode(file_content).decode('utf-8')
            data_url = f"data:application/splat;base64,{base64_content}"
            file_type = "3D Splat Model"
        elif file.filename and file.filename.endswith('.ply'):
            # For .ply files (3D mesh/point cloud)
            base64_content = base64.b64encode(file_content).decode('utf-8')
            data_url = f"data:application/ply;base64,{base64_content}"
            file_type = "3D PLY Model"
        else:
            # For regular images
            content_type = file.content_type or 'image/jpeg'
            base64_content = base64.b64encode(file_content).decode('utf-8')
            data_url = f"data:{content_type};base64,{base64_content}"
            file_type = "Image"
        
        # Get existing content
        existing_content = await db.homepage_content.find_one({"id": "main"})
        
        if existing_content:
            current_content = HomepageContent(**existing_content)
        else:
            current_content = HomepageContent(id="main")
        
        # Update hero image
        current_content.hero.hero_image_base64 = data_url
        current_content.updated_at = datetime.now()
        
        # Save to database
        content_dict = current_content.dict()
        await db.homepage_content.update_one(
            {"id": "main"},
            {"$set": content_dict},
            upsert=True
        )
        
        return {
            "message": f"Hero {file_type.lower()} uploaded successfully", 
            "image_url": data_url, 
            "file_type": file_type,
            "file_size": f"{file_size / (1024*1024):.1f}MB"
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions (like file size errors)
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading hero file: {str(e)}"
        )

@router.post("/upload/demo/{index}")
async def upload_demo_image(
    index: int,
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Upload demo image for homepage.
    """
    try:
        # Validate index
        if index < 0 or index > 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Demo image index must be between 0 and 2"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Convert to base64
        base64_content = base64.b64encode(file_content).decode('utf-8')
        data_url = f"data:{file.content_type};base64,{base64_content}"
        
        # Get existing content
        existing_content = await db.homepage_content.find_one({"id": "main"})
        
        if existing_content:
            current_content = HomepageContent(**existing_content)
        else:
            current_content = HomepageContent(id="main")
        
        # Update demo image
        if index < len(current_content.demo_items):
            current_content.demo_items[index].image_base64 = data_url
        
        current_content.updated_at = datetime.now()
        
        # Save to database
        content_dict = current_content.dict()
        await db.homepage_content.update_one(
            {"id": "main"},
            {"$set": content_dict},
            upsert=True
        )
        
        return {"message": f"Demo image {index} uploaded successfully", "image_url": data_url}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading demo image: {str(e)}"
        )