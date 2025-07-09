from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class HomepageHeroContent(BaseModel):
    headline: str = Field(default="Bring Your Menu to Life in 3D")
    subheadline: str = Field(default="Let customers explore your dishes with immersive, real food scans.")
    hero_image_base64: Optional[str] = Field(default=None)
    primary_cta_text: str = Field(default="View Sample Menu")
    primary_cta_url: str = Field(default="/menu")
    secondary_cta_text: str = Field(default="Contact Us")
    secondary_cta_url: str = Field(default="#contact")

class HomepageFeature(BaseModel):
    icon: str = Field(default="camera")  # Icon name
    title: str
    description: str
    color: str = Field(default="blue")  # Color scheme

class HomepageTestimonial(BaseModel):
    name: str
    title: str
    avatar_url: Optional[str] = Field(default=None)
    rating: int = Field(default=5, ge=1, le=5)
    quote: str

class HomepageDemoItem(BaseModel):
    name: str
    description: str
    image_base64: Optional[str] = Field(default=None)
    menu_link: str = Field(default="/menu")
    emoji: str = Field(default="🍔")

class HomepageContent(BaseModel):
    id: Optional[str] = Field(default=None)
    hero: HomepageHeroContent = Field(default_factory=HomepageHeroContent)
    features: List[HomepageFeature] = Field(default_factory=lambda: [
        HomepageFeature(
            icon="camera",
            title="Real Food Scans",
            description="Authentic 3D models from real dishes",
            color="blue"
        ),
        HomepageFeature(
            icon="smartphone",
            title="No App Needed",
            description="Works directly in web browsers",
            color="green"
        ),
        HomepageFeature(
            icon="refresh-cw",
            title="Live Menu Updates",
            description="Real-time menu modifications",
            color="orange"
        )
    ])
    testimonials: List[HomepageTestimonial] = Field(default_factory=lambda: [
        HomepageTestimonial(
            name="Jane Doe",
            title="Restaurant Manager",
            quote="Our customers love the 3D menu—it sets us apart!"
        ),
        HomepageTestimonial(
            name="Mike Smith",
            title="Head Chef",
            quote="TAST3D has been a game changer for our business."
        )
    ])
    demo_items: List[HomepageDemoItem] = Field(default_factory=lambda: [
        HomepageDemoItem(
            name="Cheeseburger",
            description="Classic beef burger with cheese",
            emoji="🍔"
        ),
        HomepageDemoItem(
            name="Caesar Salad",
            description="Fresh romaine with parmesan",
            emoji="🥗"
        ),
        HomepageDemoItem(
            name="Chocolate Donut",
            description="Glazed chocolate donut",
            emoji="🍩"
        )
    ])
    updated_at: datetime = Field(default_factory=datetime.now)

class HomepageContentUpdate(BaseModel):
    hero: Optional[HomepageHeroContent] = None
    features: Optional[List[HomepageFeature]] = None
    testimonials: Optional[List[HomepageTestimonial]] = None
    demo_items: Optional[List[HomepageDemoItem]] = None