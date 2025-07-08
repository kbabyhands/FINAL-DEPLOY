from fastapi import APIRouter, HTTPException, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.homepage import HomepageContent, HomepageContentUpdate
from datetime import datetime
from typing import Optional
import uuid

router = APIRouter(prefix="/api/homepage", tags=["homepage"])

# This would normally be imported from auth, but for now we'll use a simple dependency
async def get_admin_user():
    # In a real implementation, this would check authentication
    return {"user_id": "admin", "is_admin": True}

def get_database():
    from server import database
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
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_admin_user)
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