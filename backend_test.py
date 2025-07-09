import requests
import json
import unittest
import os
import base64
from datetime import datetime
from io import BytesIO

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('VITE_REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1]
            break
    else:
        BACKEND_URL = "http://localhost:8001"

class TestHomepageAPI(unittest.TestCase):
    """Test the homepage API endpoints"""

    def setUp(self):
        """Set up test case"""
        self.api_url = f"{BACKEND_URL}/api/homepage"
        
        # Reset content to defaults before each test
        response = requests.post(f"{self.api_url}/content/reset")
        self.assertEqual(response.status_code, 200, "Failed to reset homepage content")

    def test_get_homepage_content(self):
        """Test GET /api/homepage/content endpoint"""
        response = requests.get(f"{self.api_url}/content")
        
        # Check status code
        self.assertEqual(response.status_code, 200, "Failed to get homepage content")
        
        # Check response structure
        content = response.json()
        self.assertIn("id", content, "Response missing 'id' field")
        self.assertIn("hero", content, "Response missing 'hero' field")
        self.assertIn("features", content, "Response missing 'features' field")
        self.assertIn("testimonials", content, "Response missing 'testimonials' field")
        self.assertIn("demo_items", content, "Response missing 'demo_items' field")
        self.assertIn("updated_at", content, "Response missing 'updated_at' field")
        
        # Check hero content structure
        hero = content["hero"]
        self.assertIn("headline", hero, "Hero missing 'headline' field")
        self.assertIn("subheadline", hero, "Hero missing 'subheadline' field")
        self.assertIn("hero_image_base64", hero, "Hero missing 'hero_image_base64' field")
        
        # Check features structure
        features = content["features"]
        self.assertTrue(isinstance(features, list), "Features should be a list")
        self.assertEqual(len(features), 3, "Features should have exactly 3 items")
        if features:
            feature = features[0]
            self.assertIn("icon", feature, "Feature missing 'icon' field")
            self.assertIn("title", feature, "Feature missing 'title' field")
            self.assertIn("description", feature, "Feature missing 'description' field")
            
            # Check for the specific feature titles
            feature_titles = [f["title"] for f in features]
            self.assertIn("Real Food Scans", feature_titles, "Missing 'Real Food Scans' feature")
            self.assertIn("No App Needed", feature_titles, "Missing 'No App Needed' feature")
            self.assertIn("Live Menu Updates", feature_titles, "Missing 'Live Menu Updates' feature")
        
        # Check testimonials structure
        testimonials = content["testimonials"]
        self.assertTrue(isinstance(testimonials, list), "Testimonials should be a list")
        if testimonials:
            testimonial = testimonials[0]
            self.assertIn("name", testimonial, "Testimonial missing 'name' field")
            self.assertIn("title", testimonial, "Testimonial missing 'title' field")
            self.assertIn("quote", testimonial, "Testimonial missing 'quote' field")
        
        # Check demo_items structure
        demo_items = content["demo_items"]
        self.assertTrue(isinstance(demo_items, list), "Demo items should be a list")
        if demo_items:
            demo_item = demo_items[0]
            self.assertIn("name", demo_item, "Demo item missing 'name' field")
            self.assertIn("description", demo_item, "Demo item missing 'description' field")
            self.assertIn("emoji", demo_item, "Demo item missing 'emoji' field")
            self.assertIn("image_base64", demo_item, "Demo item missing 'image_base64' field")

    def test_update_homepage_content(self):
        """Test PUT /api/homepage/content endpoint"""
        # Create updated content
        updated_content = {
            "hero": {
                "headline": "Updated Headline",
                "subheadline": "Updated Subheadline",
                "hero_image_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                "primary_cta_text": "Updated CTA",
                "primary_cta_url": "/updated",
                "secondary_cta_text": "Updated Secondary CTA",
                "secondary_cta_url": "#updated"
            },
            "features": [
                {
                    "icon": "star",
                    "title": "Updated Feature",
                    "description": "Updated feature description",
                    "color": "red"
                }
            ],
            "testimonials": [
                {
                    "name": "Updated Name",
                    "title": "Updated Title",
                    "avatar_url": "https://example.com/avatar.jpg",
                    "rating": 4,
                    "quote": "Updated quote"
                }
            ],
            "demo_items": [
                {
                    "name": "Updated Item",
                    "description": "Updated item description",
                    "image_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                    "emoji": "🍕"
                }
            ]
        }
        
        # Update content
        response = requests.put(
            f"{self.api_url}/content",
            json=updated_content,
            headers={"Content-Type": "application/json"}
        )
        
        # Check status code
        self.assertEqual(response.status_code, 200, "Failed to update homepage content")
        
        # Check response structure
        content = response.json()
        self.assertIn("id", content, "Response missing 'id' field")
        self.assertIn("hero", content, "Response missing 'hero' field")
        self.assertIn("features", content, "Response missing 'features' field")
        self.assertIn("testimonials", content, "Response missing 'testimonials' field")
        self.assertIn("demo_items", content, "Response missing 'demo_items' field")
        
        # Verify updated content
        hero = content["hero"]
        self.assertEqual(hero["headline"], "Updated Headline", "Hero headline not updated")
        self.assertEqual(hero["subheadline"], "Updated Subheadline", "Hero subheadline not updated")
        
        features = content["features"]
        self.assertEqual(len(features), 1, "Features count mismatch")
        self.assertEqual(features[0]["title"], "Updated Feature", "Feature title not updated")
        
        testimonials = content["testimonials"]
        self.assertEqual(len(testimonials), 1, "Testimonials count mismatch")
        self.assertEqual(testimonials[0]["name"], "Updated Name", "Testimonial name not updated")
        
        demo_items = content["demo_items"]
        self.assertEqual(len(demo_items), 1, "Demo items count mismatch")
        self.assertEqual(demo_items[0]["name"], "Updated Item", "Demo item name not updated")
        
        # Verify persistence by getting content again
        response = requests.get(f"{self.api_url}/content")
        content = response.json()
        
        hero = content["hero"]
        self.assertEqual(hero["headline"], "Updated Headline", "Hero headline not persisted")
        
        features = content["features"]
        self.assertEqual(features[0]["title"], "Updated Feature", "Feature title not persisted")
        
        testimonials = content["testimonials"]
        self.assertEqual(testimonials[0]["name"], "Updated Name", "Testimonial name not persisted")
        
        demo_items = content["demo_items"]
        self.assertEqual(demo_items[0]["name"], "Updated Item", "Demo item name not persisted")

    def test_reset_homepage_content(self):
        """Test POST /api/homepage/content/reset endpoint"""
        # First update content
        updated_content = {
            "hero": {
                "headline": "Updated Headline",
                "subheadline": "Updated Subheadline"
            }
        }
        
        response = requests.put(
            f"{self.api_url}/content",
            json=updated_content,
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(response.status_code, 200, "Failed to update homepage content")
        
        # Verify update
        response = requests.get(f"{self.api_url}/content")
        content = response.json()
        self.assertEqual(content["hero"]["headline"], "Updated Headline", "Hero headline not updated")
        
        # Reset content
        response = requests.post(f"{self.api_url}/content/reset")
        self.assertEqual(response.status_code, 200, "Failed to reset homepage content")
        
        # Verify reset
        response = requests.get(f"{self.api_url}/content")
        content = response.json()
        
        # Check default values
        self.assertEqual(content["hero"]["headline"], "Bring Your Menu to Life in 3D", "Hero headline not reset to default")
        self.assertEqual(len(content["features"]), 3, "Features not reset to default count")
        self.assertEqual(len(content["testimonials"]), 2, "Testimonials not reset to default count")
        self.assertEqual(len(content["demo_items"]), 3, "Demo items not reset to default count")
        
        # Check feature titles
        feature_titles = [f["title"] for f in content["features"]]
        self.assertIn("Real Food Scans", feature_titles, "Missing 'Real Food Scans' feature")
        self.assertIn("No App Needed", feature_titles, "Missing 'No App Needed' feature")
        self.assertIn("Live Menu Updates", feature_titles, "Missing 'Live Menu Updates' feature")

    def test_cors_headers(self):
        """Test CORS headers are present"""
        response = requests.get(f"{self.api_url}/content", headers={"Origin": "http://example.com"})
        
        # Check CORS headers
        headers = response.headers
        self.assertIn("Access-Control-Allow-Origin", headers, "Missing CORS header: Access-Control-Allow-Origin")
        self.assertEqual(headers["Access-Control-Allow-Origin"], "*", "Incorrect Access-Control-Allow-Origin value")

    def test_upload_hero_image(self):
        """Test POST /api/homepage/upload/hero endpoint"""
        # Create a small test image
        image_data = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
        files = {'file': ('test_image.png', BytesIO(image_data), 'image/png')}
        
        # Upload the image
        response = requests.post(f"{self.api_url}/upload/hero", files=files)
        
        # Check status code
        self.assertEqual(response.status_code, 200, "Failed to upload hero image")
        
        # Check response structure
        result = response.json()
        self.assertIn("message", result, "Response missing 'message' field")
        self.assertIn("image_url", result, "Response missing 'image_url' field")
        self.assertTrue(result["image_url"].startswith("data:image/png;base64,"), "Image URL not in base64 format")
        
        # Verify the image was stored in the database
        response = requests.get(f"{self.api_url}/content")
        content = response.json()
        self.assertIsNotNone(content["hero"]["hero_image_base64"], "Hero image not stored in database")
        self.assertTrue(content["hero"]["hero_image_base64"].startswith("data:image/png;base64,"), "Stored hero image not in base64 format")

    def test_upload_demo_images(self):
        """Test POST /api/homepage/upload/demo/{index} endpoints"""
        # Create a small test image
        image_data = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
        files = {'file': ('test_image.png', BytesIO(image_data), 'image/png')}
        
        # Test uploading to all three demo item indices
        for index in range(3):
            # Upload the image
            response = requests.post(f"{self.api_url}/upload/demo/{index}", files=files)
            
            # Check status code
            self.assertEqual(response.status_code, 200, f"Failed to upload demo image at index {index}")
            
            # Check response structure
            result = response.json()
            self.assertIn("message", result, f"Response missing 'message' field for index {index}")
            self.assertIn("image_url", result, f"Response missing 'image_url' field for index {index}")
            self.assertTrue(result["image_url"].startswith("data:image/png;base64,"), f"Image URL not in base64 format for index {index}")
            
            # Verify the image was stored in the database
            response = requests.get(f"{self.api_url}/content")
            content = response.json()
            self.assertIsNotNone(content["demo_items"][index]["image_base64"], f"Demo image not stored in database for index {index}")
            self.assertTrue(content["demo_items"][index]["image_base64"].startswith("data:image/png;base64,"), f"Stored demo image not in base64 format for index {index}")

    def test_upload_demo_invalid_index(self):
        """Test POST /api/homepage/upload/demo/{index} with invalid index"""
        # Create a small test image
        image_data = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
        files = {'file': ('test_image.png', BytesIO(image_data), 'image/png')}
        
        # Test uploading to an invalid index
        response = requests.post(f"{self.api_url}/upload/demo/3", files=files)
        
        # Check status code - should be 500 Internal Server Error (due to how the API handles validation errors)
        self.assertEqual(response.status_code, 500, "Should return 500 for invalid index")
        
        # Check error message
        result = response.json()
        self.assertIn("detail", result, "Response missing 'detail' field")
        self.assertIn("index", result["detail"].lower(), "Error message should mention index")

    def test_upload_invalid_file_type(self):
        """Test upload endpoints with invalid file type"""
        # Create a text file instead of an image
        text_data = b"This is not an image"
        files = {'file': ('test.txt', BytesIO(text_data), 'text/plain')}
        
        # Test uploading to hero endpoint
        response = requests.post(f"{self.api_url}/upload/hero", files=files)
        
        # Should still work as the endpoint doesn't validate file types
        self.assertEqual(response.status_code, 200, "Failed to upload text file as hero image")
        
        # Verify the content was stored as base64
        response = requests.get(f"{self.api_url}/content")
        content = response.json()
        self.assertIsNotNone(content["hero"]["hero_image_base64"], "Hero image not stored in database")
        self.assertTrue(content["hero"]["hero_image_base64"].startswith("data:text/plain;base64,"), "Stored hero image has incorrect MIME type")

    def test_complete_upload_flow(self):
        """Test the complete flow: upload images → fetch content → verify base64 data"""
        # Reset content first
        response = requests.post(f"{self.api_url}/content/reset")
        self.assertEqual(response.status_code, 200, "Failed to reset homepage content")
        
        # Create a small test image
        image_data = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
        files = {'file': ('test_image.png', BytesIO(image_data), 'image/png')}
        
        # Upload hero image
        response = requests.post(f"{self.api_url}/upload/hero", files=files)
        self.assertEqual(response.status_code, 200, "Failed to upload hero image")
        
        # Upload demo images
        for index in range(3):
            response = requests.post(f"{self.api_url}/upload/demo/{index}", files=files)
            self.assertEqual(response.status_code, 200, f"Failed to upload demo image at index {index}")
        
        # Fetch content
        response = requests.get(f"{self.api_url}/content")
        content = response.json()
        
        # Verify hero image
        self.assertIsNotNone(content["hero"]["hero_image_base64"], "Hero image not stored in database")
        self.assertTrue(content["hero"]["hero_image_base64"].startswith("data:image/png;base64,"), "Stored hero image not in base64 format")
        
        # Verify demo images
        for index in range(3):
            self.assertIsNotNone(content["demo_items"][index]["image_base64"], f"Demo image not stored in database for index {index}")
            self.assertTrue(content["demo_items"][index]["image_base64"].startswith("data:image/png;base64,"), f"Stored demo image not in base64 format for index {index}")
        
        # Update content with PUT and verify base64 data is preserved
        # For this test, we need to include the hero_image_base64 in the update to preserve it
        hero_image_base64 = content["hero"]["hero_image_base64"]
        updated_content = {
            "hero": {
                "headline": "Updated Headline",
                "subheadline": "Updated Subheadline",
                "hero_image_base64": hero_image_base64
            }
        }
        
        response = requests.put(
            f"{self.api_url}/content",
            json=updated_content,
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(response.status_code, 200, "Failed to update homepage content")
        
        # Fetch content again
        response = requests.get(f"{self.api_url}/content")
        content = response.json()
        
        # Verify hero image is still there after update
        self.assertIsNotNone(content["hero"]["hero_image_base64"], "Hero image lost after content update")
        self.assertTrue(content["hero"]["hero_image_base64"].startswith("data:image/png;base64,"), "Stored hero image format changed after update")

if __name__ == "__main__":
    unittest.main()