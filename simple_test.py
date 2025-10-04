#!/usr/bin/env python3
"""
Simple test to verify core functionality
"""

import requests
import json
import time

base_url = "http://localhost:8001"

def test_basic_functionality():
    print("Testing basic functionality...")
    
    # Test server health
    response = requests.get(f"{base_url}/api/profile")
    print(f"Server health: {response.status_code} - {'✅' if response.status_code == 401 else '❌'}")
    
    # Test registration
    timestamp = int(time.time())
    user_data = {
        "name": "Simple Test User",
        "email": f"simple_test_{timestamp}@example.com",
        "phone": "0123456789",
        "password": "password123",
        "userType": "OKU User"
    }
    
    response = requests.post(f"{base_url}/api/register", json=user_data)
    print(f"Registration: {response.status_code} - {'✅' if response.status_code == 200 else '❌'}")
    
    # Test login
    login_data = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    
    response = requests.post(f"{base_url}/api/login", json=login_data)
    print(f"Login: {response.status_code} - {'✅' if response.status_code == 200 else '❌'}")
    
    if response.status_code == 200:
        token = response.json().get('token')
        
        # Test protected route
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(f"{base_url}/api/profile", headers=headers)
        print(f"Protected route: {response.status_code} - {'✅' if response.status_code == 200 else '❌'}")
        
        # Test invalid token
        headers = {'Authorization': 'Bearer invalid.token'}
        response = requests.get(f"{base_url}/api/profile", headers=headers)
        print(f"Invalid token: {response.status_code} - {'✅' if response.status_code == 403 else '❌'}")

if __name__ == "__main__":
    test_basic_functionality()