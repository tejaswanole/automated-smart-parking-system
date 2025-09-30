#!/usr/bin/env python3
"""
Test script for CV Model Backend
Tests basic functionality without requiring actual camera input
"""

import requests
import json
import time
import sys
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:5001"
TEST_PARKING_ID = "test_parking_001"

def test_health_check():
    """Test health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_welcome():
    """Test welcome endpoint"""
    print("Testing welcome endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Welcome endpoint: {data}")
            return True
        else:
            print(f"❌ Welcome endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Welcome endpoint error: {e}")
        return False

def test_config():
    """Test configuration endpoint"""
    print("Testing configuration endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/config")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Configuration: {data}")
            return True
        else:
            print(f"❌ Configuration endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Configuration endpoint error: {e}")
        return False

def test_list_processors():
    """Test list processors endpoint"""
    print("Testing list processors...")
    try:
        response = requests.get(f"{BASE_URL}/list")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ List processors: {data}")
            return True
        else:
            print(f"❌ List processors failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ List processors error: {e}")
        return False

def test_init_parking():
    """Test parking initialization"""
    print("Testing parking initialization...")
    
    # Test data - using a sample video file or RTSP stream
    test_config = {
        "parking_id": TEST_PARKING_ID,
        "capacities": {
            "car": 50,
            "bus_truck": 10,
            "bike": 100
        },
        "camera_source": "0",  # Use default camera (0) or test video file
        "model_id": "test_cv_model"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/init",
            json=test_config,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Parking initialized: {data}")
            return True
        else:
            print(f"❌ Parking initialization failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Parking initialization error: {e}")
        return False

def test_get_status():
    """Test get parking status"""
    print("Testing get parking status...")
    try:
        response = requests.get(f"{BASE_URL}/status/{TEST_PARKING_ID}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Parking status: {data}")
            return True
        else:
            print(f"❌ Get status failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Get status error: {e}")
        return False

def test_manual_adjust():
    """Test manual count adjustment"""
    print("Testing manual count adjustment...")
    
    adjustments = {
        "adjustments": {
            "car": 25,
            "bus_truck": 3,
            "bike": 45
        }
    }
    
    try:
        response = requests.patch(
            f"{BASE_URL}/adjust/{TEST_PARKING_ID}",
            json=adjustments,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Manual adjustment: {data}")
            return True
        else:
            print(f"❌ Manual adjustment failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Manual adjustment error: {e}")
        return False

def test_stop_parking():
    """Test stopping parking processor"""
    print("Testing stop parking...")
    try:
        response = requests.post(f"{BASE_URL}/stop/{TEST_PARKING_ID}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Parking stopped: {data}")
            return True
        else:
            print(f"❌ Stop parking failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Stop parking error: {e}")
        return False

def test_invalid_parking_id():
    """Test with invalid parking ID"""
    print("Testing invalid parking ID...")
    try:
        response = requests.get(f"{BASE_URL}/status/invalid_parking_id")
        if response.status_code == 404:
            print("✅ Invalid parking ID handled correctly")
            return True
        else:
            print(f"❌ Invalid parking ID not handled: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Invalid parking ID test error: {e}")
        return False

def test_invalid_init_data():
    """Test initialization with invalid data"""
    print("Testing invalid initialization data...")
    
    invalid_config = {
        "parking_id": "test_invalid",
        "capacities": {
            "car": 50
            # Missing required vehicle types
        },
        "camera_source": "invalid_source"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/init",
            json=invalid_config,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 400:
            print("✅ Invalid initialization data handled correctly")
            return True
        else:
            print(f"❌ Invalid initialization data not handled: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Invalid initialization test error: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("🚀 Starting CV Model Backend Tests")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Welcome Endpoint", test_welcome),
        ("Configuration", test_config),
        ("List Processors", test_list_processors),
        ("Invalid Init Data", test_invalid_init_data),
        ("Parking Initialization", test_init_parking),
        ("Get Status", test_get_status),
        ("Manual Adjustment", test_manual_adjust),
        ("Stop Parking", test_stop_parking),
        ("Invalid Parking ID", test_invalid_parking_id),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} failed")
        except Exception as e:
            print(f"❌ {test_name} error: {e}")
        
        time.sleep(0.5)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return True
    else:
        print("⚠️  Some tests failed. Check the output above.")
        return False

def main():
    """Main function"""
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print("""
CV Model Backend Test Script

Usage:
    python test_cv_model.py          # Run all tests
    python test_cv_model.py --help   # Show this help

Prerequisites:
    1. CV Model Backend must be running on http://localhost:5001
    2. Core Backend should be running (for Socket.IO tests)
    3. Camera or video source should be available

Note: Some tests may fail if the backend is not running or if camera access is not available.
        """)
        return
    
    success = run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
