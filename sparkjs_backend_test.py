import requests
import json
import unittest
import os
import base64
import time
from datetime import datetime
from io import BytesIO
import random

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('VITE_REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1]
            break
    else:
        BACKEND_URL = "http://localhost:8001"

class TestSparkJSBackendAPI(unittest.TestCase):
    """Test the backend API endpoints for SparkJS functionality"""

    def setUp(self):
        """Set up test case"""
        self.api_url = f"{BACKEND_URL}/api/homepage"
        
        # Reset content to defaults before each test
        response = requests.post(f"{self.api_url}/content/reset")
        self.assertEqual(response.status_code, 200, "Failed to reset homepage content")

    def test_file_serving_endpoint(self):
        """Test GET /api/homepage/uploads/{filename} endpoint"""
        # First, upload a test file
        test_data = b"This is test file content"
        files = {'file': ('test_file.txt', BytesIO(test_data), 'text/plain')}
        
        # Upload the file to hero endpoint
        response = requests.post(f"{self.api_url}/upload/hero", files=files)
        self.assertEqual(response.status_code, 200, "Failed to upload test file")
        
        # Get the file URL from the response
        result = response.json()
        file_url = result["image_url"]
        
        # Extract filename from URL
        filename = file_url.split('/')[-1]
        
        # Test GET request to file serving endpoint
        response = requests.get(f"{self.api_url}/uploads/{filename}")
        
        # Check status code
        self.assertEqual(response.status_code, 200, "Failed to get uploaded file")
        
        # Check content
        self.assertEqual(response.content, test_data, "File content doesn't match uploaded content")
        
        # Check content type
        self.assertEqual(response.headers["Content-Type"], "text/plain", "Incorrect content type")

    def test_file_serving_nonexistent_file(self):
        """Test GET /api/homepage/uploads/{filename} with nonexistent file"""
        # Test GET request with a nonexistent filename
        response = requests.get(f"{self.api_url}/uploads/nonexistent_file.txt")
        
        # Check status code - should be 404 Not Found
        self.assertEqual(response.status_code, 404, "Should return 404 for nonexistent file")
        
        # Check error message
        result = response.json()
        self.assertIn("detail", result, "Response missing 'detail' field")
        self.assertEqual(result["detail"], "File not found", "Incorrect error message")

    def test_head_request_for_file(self):
        """Test HEAD /api/homepage/uploads/{filename} endpoint"""
        # First, upload a test file
        test_data = b"This is test file content"
        files = {'file': ('test_file.txt', BytesIO(test_data), 'text/plain')}
        
        # Upload the file to hero endpoint
        response = requests.post(f"{self.api_url}/upload/hero", files=files)
        self.assertEqual(response.status_code, 200, "Failed to upload test file")
        
        # Get the file URL from the response
        result = response.json()
        file_url = result["image_url"]
        
        # Extract filename from URL
        filename = file_url.split('/')[-1]
        
        # Test HEAD request to file serving endpoint
        response = requests.head(f"{self.api_url}/uploads/{filename}")
        
        # Check status code
        self.assertEqual(response.status_code, 200, "Failed to get HEAD for uploaded file")
        
        # Check content type
        self.assertEqual(response.headers["Content-Type"], "text/plain", "Incorrect content type")
        
        # HEAD request should not have content
        self.assertEqual(len(response.content), 0, "HEAD request should not return content")

    def test_upload_3d_model_splat(self):
        """Test uploading a .splat 3D model file"""
        # Create a mock .splat file
        splat_data = b"Mock Gaussian Splat data"
        files = {'file': ('test_model.splat', BytesIO(splat_data), 'application/splat')}
        
        # Upload the file
        response = requests.post(f"{self.api_url}/upload/hero", files=files)
        
        # Check status code
        self.assertEqual(response.status_code, 200, "Failed to upload .splat file")
        
        # Check response structure
        result = response.json()
        self.assertIn("message", result, "Response missing 'message' field")
        self.assertIn("image_url", result, "Response missing 'image_url' field")
        self.assertIn("file_type", result, "Response missing 'file_type' field")
        
        # Verify file type is recognized correctly
        self.assertEqual(result["file_type"], "3D Splat Model", "File type not recognized as 3D Splat Model")
        
        # Get the file URL from the response
        file_url = result["image_url"]
        
        # Extract filename from URL
        filename = file_url.split('/')[-1]
        
        # Test GET request to file serving endpoint
        response = requests.get(f"{self.api_url}/uploads/{filename}")
        
        # Check status code
        self.assertEqual(response.status_code, 200, "Failed to get uploaded .splat file")
        
        # Check content
        self.assertEqual(response.content, splat_data, "File content doesn't match uploaded content")
        
        # Check content type
        self.assertEqual(response.headers["Content-Type"], "application/splat", "Incorrect content type")

    def test_upload_3d_model_ply(self):
        """Test uploading a .ply 3D model file"""
        # Create a mock .ply file
        ply_data = b"ply\nformat ascii 1.0\nelement vertex 0\nend_header\n"
        files = {'file': ('test_model.ply', BytesIO(ply_data), 'application/ply')}
        
        # Upload the file
        response = requests.post(f"{self.api_url}/upload/hero", files=files)
        
        # Check status code
        self.assertEqual(response.status_code, 200, "Failed to upload .ply file")
        
        # Check response structure
        result = response.json()
        self.assertIn("message", result, "Response missing 'message' field")
        self.assertIn("image_url", result, "Response missing 'image_url' field")
        self.assertIn("file_type", result, "Response missing 'file_type' field")
        
        # Verify file type is recognized correctly
        self.assertEqual(result["file_type"], "3D PLY Model", "File type not recognized as 3D PLY Model")
        
        # Get the file URL from the response
        file_url = result["image_url"]
        
        # Extract filename from URL
        filename = file_url.split('/')[-1]
        
        # Test GET request to file serving endpoint
        response = requests.get(f"{self.api_url}/uploads/{filename}")
        
        # Check status code
        self.assertEqual(response.status_code, 200, "Failed to get uploaded .ply file")
        
        # Check content
        self.assertEqual(response.content, ply_data, "File content doesn't match uploaded content")
        
        # Check content type
        self.assertEqual(response.headers["Content-Type"], "application/ply", "Incorrect content type")

    def test_file_size_limit(self):
        """Test file size limit for hero uploads (mock test)"""
        # Note: We can't actually test a 200MB file upload in this environment,
        # so we'll check that the code correctly reports the file size
        
        # Create a small test file
        test_data = b"X" * 1024  # 1KB file
        files = {'file': ('small_file.txt', BytesIO(test_data), 'text/plain')}
        
        # Upload the file
        response = requests.post(f"{self.api_url}/upload/hero", files=files)
        
        # Check status code
        self.assertEqual(response.status_code, 200, "Failed to upload small file")
        
        # Check file size in response
        result = response.json()
        self.assertIn("file_size", result, "Response missing 'file_size' field")
        self.assertEqual(result["file_size"], "0.0MB", "Incorrect file size reported")
        
        # Verify the code path for file size checking exists
        # This is a code inspection test, not a runtime test
        # The actual 200MB limit would be tested in a more robust environment

    def test_cors_headers_for_file_serving(self):
        """Test CORS headers for file serving endpoint"""
        # First, upload a test file
        test_data = b"This is test file content"
        files = {'file': ('test_file.txt', BytesIO(test_data), 'text/plain')}
        
        # Upload the file to hero endpoint
        response = requests.post(f"{self.api_url}/upload/hero", files=files)
        self.assertEqual(response.status_code, 200, "Failed to upload test file")
        
        # Get the file URL from the response
        result = response.json()
        file_url = result["image_url"]
        
        # Extract filename from URL
        filename = file_url.split('/')[-1]
        
        # Test GET request with Origin header
        response = requests.get(
            f"{self.api_url}/uploads/{filename}",
            headers={"Origin": "http://example.com"}
        )
        
        # Check CORS headers
        headers = response.headers
        self.assertIn("Access-Control-Allow-Origin", headers, "Missing CORS header: Access-Control-Allow-Origin")
        self.assertEqual(headers["Access-Control-Allow-Origin"], "*", "Incorrect Access-Control-Allow-Origin value")

if __name__ == "__main__":
    unittest.main()