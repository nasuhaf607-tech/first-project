#!/usr/bin/env python3
"""
OKU Transport System - Backend API Testing
Comprehensive testing for database connection, authentication, bookings, assignments, GPS tracking
"""

import requests
import json
import sys
from datetime import datetime, timedelta
import time
import mysql.connector

class OKUTransportAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.driver_token = None
        self.driver_data = None
        self.admin_token = None
        self.admin_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.test_users = []  # Store created test users

    def log_test(self, name, success, message="", response_data=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = {
            "test": name,
            "status": status,
            "message": message,
            "response_data": response_data
        }
        self.test_results.append(result)
        print(f"{status} - {name}: {message}")
        return success

    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        if headers:
            default_headers.update(headers)
        
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=5)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=5)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=5)
            
            print(f"Request: {method} {url} -> Status: {response.status_code}")
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request error for {method} {url}: {str(e)}")
            return None

    def test_database_connection(self):
        """Test MySQL database connection"""
        print("\n🔍 Testing Database Connection...")
        
        try:
            # Test database connection directly
            connection = mysql.connector.connect(
                host='localhost',
                user='root',
                password='password123',
                database='dbuser'
            )
            
            cursor = connection.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
            if result and result[0] == 1:
                # Test if required tables exist
                cursor.execute("SHOW TABLES")
                tables = [table[0] for table in cursor.fetchall()]
                required_tables = ['tbuser', 'tbbook', 'assignments', 'gps_tracking', 'tbaccessibilities']
                
                missing_tables = [table for table in required_tables if table not in tables]
                
                if missing_tables:
                    return self.log_test("Database Connection", False, f"Missing tables: {missing_tables}")
                else:
                    return self.log_test("Database Connection", True, "Database connected and all required tables exist")
            else:
                return self.log_test("Database Connection", False, "Database query failed")
                
        except mysql.connector.Error as e:
            return self.log_test("Database Connection", False, f"Database connection failed: {str(e)}")
        except Exception as e:
            return self.log_test("Database Connection", False, f"Unexpected error: {str(e)}")
        finally:
            if 'connection' in locals() and connection.is_connected():
                cursor.close()
                connection.close()

    def test_server_health(self):
        """Test if server is running and responding"""
        print("\n🔍 Testing Server Health...")
        
        response = self.make_request('GET', 'api/profile')
        if response and response.status_code == 401:
            return self.log_test("Server Health Check", True, "Server is running and responding with correct auth error")
        else:
            return self.log_test("Server Health Check", False, f"Expected 401, got {response.status_code if response else 'No response'}")

    def test_user_registration(self):
        """Test user registration functionality for all user types"""
        print("\n🔍 Testing User Registration...")
        
        # Test data for different user types
        timestamp = int(time.time())
        test_users = [
            {
                "name": "Test OKU User",
                "email": f"oku_test_{timestamp}@example.com",
                "phone": "0123456789",
                "password": "password123",
                "userType": "OKU User"
            },
            {
                "name": "Test Driver",
                "email": f"driver_test_{timestamp}@example.com", 
                "phone": "0123456790",
                "password": "password123",
                "userType": "Driver"
            },
            {
                "name": "Test Company Admin",
                "email": f"admin_test_{timestamp}@example.com",
                "phone": "0123456791",
                "password": "password123",
                "userType": "Company Admin"
            },
            {
                "name": "Test JKM Officer",
                "email": f"jkm_test_{timestamp}@example.com",
                "phone": "0123456792",
                "password": "password123",
                "userType": "JKM Officer"
            }
        ]
        
        registration_results = []
        
        for user_data in test_users:
            response = self.make_request('POST', 'api/register', user_data)
            
            if response and response.status_code == 200:
                response_data = response.json()
                success = self.log_test(
                    f"Register {user_data['userType']}", 
                    True, 
                    response_data.get('message', 'Registration successful'),
                    response_data
                )
                # Store user data for later tests
                user_data['userId'] = response_data.get('userId')
                self.test_users.append(user_data)
                registration_results.append({
                    'user_data': user_data,
                    'response': response_data,
                    'success': success
                })
            else:
                error_msg = response.json().get('message', 'Registration failed') if response else 'No response'
                self.log_test(
                    f"Register {user_data['userType']}", 
                    False, 
                    f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}"
                )
        
        return registration_results

    def test_user_login(self):
        """Test user login functionality for different user types"""
        print("\n🔍 Testing User Login...")
        
        login_results = []
        
        # Test login for each registered user type
        for user in self.test_users:
            test_credentials = {
                "email": user["email"],
                "password": user["password"]
            }
            
            response = self.make_request('POST', 'api/login', test_credentials)
            
            if response and response.status_code == 200:
                response_data = response.json()
                
                # Store tokens for different user types
                if user["userType"] == "OKU User":
                    self.token = response_data.get('token')
                    self.user_data = response_data.get('user')
                elif user["userType"] == "Driver":
                    self.driver_token = response_data.get('token')
                    self.driver_data = response_data.get('user')
                elif user["userType"] == "Company Admin":
                    self.admin_token = response_data.get('token')
                    self.admin_data = response_data.get('user')
                
                success = self.log_test(
                    f"Login {user['userType']}", 
                    True, 
                    f"Login successful for {user['userType']}: {response_data.get('user', {}).get('name', 'Unknown')}",
                    response_data
                )
                login_results.append(success)
            elif response and response.status_code == 403 and user["userType"] == "Driver":
                # Driver might be pending approval
                success = self.log_test(
                    f"Login {user['userType']}", 
                    True, 
                    "Driver login correctly blocked - pending approval",
                    response.json()
                )
                login_results.append(success)
            else:
                error_msg = response.json().get('message', 'Login failed') if response else 'No response'
                success = self.log_test(
                    f"Login {user['userType']}", 
                    False, 
                    f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}"
                )
                login_results.append(success)
        
        return all(login_results)

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        print("\n🔍 Testing Invalid Login...")
        
        invalid_credentials = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        response = self.make_request('POST', 'api/login', invalid_credentials)
        
        if response and response.status_code == 401:
            return self.log_test(
                "Invalid Login", 
                True, 
                "Correctly rejected invalid credentials"
            )
        else:
            return self.log_test(
                "Invalid Login", 
                False, 
                f"Expected 401, got {response.status_code if response else 'No response'}"
            )

    def test_protected_profile_route(self):
        """Test protected profile route"""
        print("\n🔍 Testing Protected Profile Route...")
        
        if not self.token:
            return self.log_test(
                "Profile Route (Protected)", 
                False, 
                "No token available - login test must pass first"
            )
        
        response = self.make_request('GET', 'api/profile')
        
        if response and response.status_code == 200:
            response_data = response.json()
            user = response_data.get('user', {})
            return self.log_test(
                "Profile Route (Protected)", 
                True, 
                f"Profile retrieved for user: {user.get('name', 'Unknown')}",
                response_data
            )
        else:
            error_msg = response.json().get('message', 'Profile fetch failed') if response else 'No response'
            return self.log_test(
                "Profile Route (Protected)", 
                False, 
                f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}"
            )

    def test_protected_route_without_token(self):
        """Test protected route without authentication token"""
        print("\n🔍 Testing Protected Route Without Token...")
        
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        response = self.make_request('GET', 'api/profile')
        
        # Restore token
        self.token = original_token
        
        if response and response.status_code == 401:
            return self.log_test(
                "Protected Route Without Token", 
                True, 
                "Correctly rejected request without token"
            )
        else:
            return self.log_test(
                "Protected Route Without Token", 
                False, 
                f"Expected 401, got {response.status_code if response else 'No response'}"
            )

    def test_driver_profile_apis(self):
        """Test driver profile completion endpoints"""
        print("\n🔍 Testing Driver Profile APIs...")
        
        if not self.driver_token:
            return self.log_test(
                "Driver Profile APIs", 
                False, 
                "No driver token available - driver login must pass first"
            )
        
        # Test driver profile status endpoint
        original_token = self.token
        self.token = self.driver_token
        
        response = self.make_request('GET', 'api/driver/profile/status')
        
        if response and response.status_code == 200:
            response_data = response.json()
            status_success = self.log_test(
                "Driver Profile Status", 
                True, 
                f"Profile status retrieved: Complete={response_data.get('isComplete', False)}, Status={response_data.get('status', 'unknown')}",
                response_data
            )
        else:
            error_msg = response.json().get('message', 'Profile status failed') if response else 'No response'
            status_success = self.log_test(
                "Driver Profile Status", 
                False, 
                f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}"
            )
        
        # Test driver profile update endpoint (without file upload for now)
        profile_data = {
            "licenseNumber": "D123456789",
            "vehicleType": "MPV",
            "vehicleNumber": "ABC1234",
            "vehicleFeatures": '["wheelchair_accessible", "air_conditioning"]',
            "experience": "5 years",
            "languages": "English, Malay",
            "emergencyContact": "Emergency Contact",
            "emergencyPhone": "0123456789",
            "address": "Test Address"
        }
        
        response = self.make_request('PUT', 'api/driver/profile', profile_data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            profile_success = self.log_test(
                "Driver Profile Update", 
                True, 
                response_data.get('message', 'Profile updated successfully'),
                response_data
            )
        else:
            error_msg = response.json().get('message', 'Profile update failed') if response else 'No response'
            profile_success = self.log_test(
                "Driver Profile Update", 
                False, 
                f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}"
            )
        
        # Restore original token
        self.token = original_token
        
        return status_success and profile_success

    def test_assignment_system(self):
        """Test assignment system APIs"""
        print("\n🔍 Testing Assignment System...")
        
        if not self.admin_token or not self.token or not self.driver_data:
            return self.log_test(
                "Assignment System", 
                False, 
                "Missing required tokens/data - admin, OKU user, and driver must be available"
            )
        
        # Test creating assignment (as admin)
        original_token = self.token
        self.token = self.admin_token
        
        assignment_data = {
            "oku_id": self.user_data.get('id'),
            "driver_id": self.driver_data.get('id'),
            "effective_from": datetime.now().strftime('%Y-%m-%d'),
            "effective_to": (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            "notes": "Test assignment"
        }
        
        response = self.make_request('POST', 'api/assignments', assignment_data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            create_success = self.log_test(
                "Create Assignment", 
                True, 
                response_data.get('message', 'Assignment created successfully'),
                response_data
            )
        else:
            error_msg = response.json().get('message', 'Assignment creation failed') if response else 'No response'
            create_success = self.log_test(
                "Create Assignment", 
                False, 
                f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}"
            )
        
        # Test getting assignments (as OKU user)
        self.token = original_token
        
        response = self.make_request('GET', 'api/assignments')
        
        if response and response.status_code == 200:
            response_data = response.json()
            get_success = self.log_test(
                "Get Assignments", 
                True, 
                f"Retrieved {len(response_data.get('assignments', []))} assignments",
                response_data
            )
        else:
            error_msg = response.json().get('message', 'Get assignments failed') if response else 'No response'
            get_success = self.log_test(
                "Get Assignments", 
                False, 
                f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}"
            )
        
        return create_success and get_success

    def test_booking_system(self):
        """Test booking system with conflict detection"""
        print("\n🔍 Testing Booking System...")
        
        if not self.token or not self.driver_data:
            return self.log_test(
                "Booking System", 
                False, 
                "Missing required tokens/data - OKU user and driver must be available"
            )
        
        # Test creating a booking
        booking_data = {
            "driver_id": self.driver_data.get('id'),
            "booking_type": "daily",
            "start_datetime": (datetime.now() + timedelta(hours=2)).strftime('%Y-%m-%d %H:%M:%S'),
            "end_datetime": (datetime.now() + timedelta(hours=4)).strftime('%Y-%m-%d %H:%M:%S'),
            "pickup_location": "Test Pickup Location",
            "pickup_lat": 5.3307,
            "pickup_lng": 103.1324,
            "dropoff_location": "Test Dropoff Location",
            "dropoff_lat": 5.3408,
            "dropoff_lng": 103.1425,
            "purpose": "Medical appointment",
            "special_instructions": "Test booking"
        }
        
        response = self.make_request('POST', 'api/bookings', booking_data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            create_success = self.log_test(
                "Create Booking", 
                True, 
                response_data.get('message', 'Booking created successfully'),
                response_data
            )
        else:
            error_msg = response.json().get('message', 'Booking creation failed') if response else 'No response'
            create_success = self.log_test(
                "Create Booking", 
                False, 
                f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}"
            )
        
        # Test getting bookings
        response = self.make_request('GET', 'api/bookings')
        
        if response and response.status_code == 200:
            response_data = response.json()
            get_success = self.log_test(
                "Get Bookings", 
                True, 
                f"Retrieved {len(response_data.get('bookings', []))} bookings",
                response_data
            )
        else:
            error_msg = response.json().get('message', 'Get bookings failed') if response else 'No response'
            get_success = self.log_test(
                "Get Bookings", 
                False, 
                f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}"
            )
        
        # Test conflict detection by creating overlapping booking
        conflicting_booking = booking_data.copy()
        conflicting_booking["start_datetime"] = (datetime.now() + timedelta(hours=1)).strftime('%Y-%m-%d %H:%M:%S')
        conflicting_booking["end_datetime"] = (datetime.now() + timedelta(hours=3)).strftime('%Y-%m-%d %H:%M:%S')
        
        response = self.make_request('POST', 'api/bookings', conflicting_booking)
        
        if response and response.status_code == 409:
            conflict_success = self.log_test(
                "Booking Conflict Detection", 
                True, 
                "Correctly detected booking conflict",
                response.json()
            )
        else:
            conflict_success = self.log_test(
                "Booking Conflict Detection", 
                False, 
                f"Expected 409 conflict, got {response.status_code if response else 'No response'}"
            )
        
        return create_success and get_success and conflict_success

    def test_driver_schedule(self):
        """Test driver schedule endpoint"""
        print("\n🔍 Testing Driver Schedule...")
        
        if not self.token or not self.driver_data:
            return self.log_test(
                "Driver Schedule", 
                False, 
                "Missing required tokens/data - OKU user and driver must be available"
            )
        
        driver_id = self.driver_data.get('id')
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Test getting driver schedule
        response = self.make_request('GET', f'api/driver/{driver_id}/schedule?date={today}')
        
        if response and response.status_code == 200:
            response_data = response.json()
            return self.log_test(
                "Driver Schedule", 
                True, 
                f"Retrieved schedule with {len(response_data.get('schedule', []))} entries",
                response_data
            )
        else:
            error_msg = response.json().get('message', 'Schedule fetch failed') if response else 'No response'
            return self.log_test(
                "Driver Schedule", 
                False, 
                f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}"
            )

    def test_gps_tracking(self):
        """Test GPS tracking endpoint"""
        print("\n🔍 Testing GPS Tracking...")
        
        if not self.driver_token:
            return self.log_test(
                "GPS Tracking", 
                False, 
                "No driver token available - driver login must pass first"
            )
        
        # Test GPS update (as driver)
        original_token = self.token
        self.token = self.driver_token
        
        gps_data = {
            "lat": 5.3307,
            "lng": 103.1324,
            "speed": 45.5,
            "heading": 180.0,
            "accuracy": 5.0,
            "booking_id": None
        }
        
        response = self.make_request('POST', 'api/gps/update', gps_data)
        
        if response and response.status_code == 200:
            response_data = response.json()
            update_success = self.log_test(
                "GPS Update", 
                True, 
                response_data.get('message', 'GPS location updated successfully'),
                response_data
            )
        else:
            error_msg = response.json().get('message', 'GPS update failed') if response else 'No response'
            update_success = self.log_test(
                "GPS Update", 
                False, 
                f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}"
            )
        
        # Test getting latest GPS locations
        response = self.make_request('GET', 'api/gps/latest')
        
        if response and response.status_code == 200:
            response_data = response.json()
            get_success = self.log_test(
                "Get GPS Locations", 
                True, 
                f"Retrieved {len(response_data.get('locations', []))} GPS locations",
                response_data
            )
        else:
            error_msg = response.json().get('message', 'GPS locations failed') if response else 'No response'
            get_success = self.log_test(
                "Get GPS Locations", 
                False, 
                f"Status: {response.status_code if response else 'No response'}, Error: {error_msg}"
            )
        
        # Restore original token
        self.token = original_token
        
        return update_success and get_success

    def test_cors_headers(self):
        """Test CORS configuration"""
        print("\n🔍 Testing CORS Configuration...")
        
        try:
            response = requests.options(f"{self.base_url}/api/login", 
                                      headers={'Origin': 'http://localhost:3000'})
            
            if response.status_code == 200 or response.status_code == 204:
                cors_headers = {
                    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
                }
                
                return self.log_test(
                    "CORS Configuration", 
                    True, 
                    "CORS headers present",
                    cors_headers
                )
            else:
                return self.log_test(
                    "CORS Configuration", 
                    False, 
                    f"OPTIONS request failed with status {response.status_code}"
                )
        except Exception as e:
            return self.log_test(
                "CORS Configuration", 
                False, 
                f"CORS test failed: {str(e)}"
            )

    def test_jwt_token_validation(self):
        """Test JWT token validation"""
        print("\n🔍 Testing JWT Token Validation...")
        
        if not self.token:
            return self.log_test(
                "JWT Token Validation", 
                False, 
                "No token available for validation test"
            )
        
        # Test with invalid token
        original_token = self.token
        self.token = "invalid.jwt.token"
        
        response = self.make_request('GET', 'api/profile')
        
        # Restore original token
        self.token = original_token
        
        if response and response.status_code == 403:
            return self.log_test(
                "JWT Token Validation", 
                True, 
                "Invalid token correctly rejected"
            )
        else:
            return self.log_test(
                "JWT Token Validation", 
                False, 
                f"Expected 403 for invalid token, got {response.status_code if response else 'No response'}"
            )

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("🚐 OKU TRANSPORT SYSTEM - BACKEND API TESTING")
        print("=" * 60)
        
        # Run tests in sequence
        self.test_server_health()
        registration_results = self.test_user_registration()
        self.test_invalid_login()
        self.test_user_login()
        self.test_protected_profile_route()
        self.test_protected_route_without_token()
        self.test_jwt_token_validation()
        self.test_cors_headers()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print detailed results
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            print(f"{result['status']} {result['test']}: {result['message']}")
        
        return {
            'total_tests': self.tests_run,
            'passed_tests': self.tests_passed,
            'failed_tests': self.tests_run - self.tests_passed,
            'success_rate': (self.tests_passed/self.tests_run)*100,
            'results': self.test_results,
            'registration_results': registration_results if 'registration_results' in locals() else []
        }

def main():
    """Main test execution"""
    tester = OKUTransportAPITester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    if results['failed_tests'] == 0:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {results['failed_tests']} test(s) failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())