import requests
import json

# Test the XAMAN API endpoint
def test_xaman_api():
    url = "http://localhost:8000/xaman/create-payment"
    data = {
        "destination": "r4jSjD22z6HtEu41eh1JrkD3KAW1PyM1RH",
        "amount": 1,
        "charity": "MEDA",
        "cause_id": "test_123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.json()
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    print("Testing XAMAN API...")
    result = test_xaman_api()
    print(f"Result: {result}")
