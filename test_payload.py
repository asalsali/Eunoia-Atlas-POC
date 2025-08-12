import requests
import json

def test_xaman_payload():
    url = "http://localhost:8000/xaman/create-payment"
    data = {
        "destination": "r4jSjD22z6HtEu41eh1JrkD3KAW1PyM1RH",
        "amount": 1,
        "charity": "MEDA",
        "cause_id": "test_whisper_123",
        "asset": "RLUSD",
        "issuer": "rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV"
    }
    
    try:
        print("Testing XAMAN payload creation...")
        print(f"URL: {url}")
        print(f"Data: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success')}")
            print(f"Payload ID: {result.get('payloadId')}")
            print(f"QR Code: {result.get('qrCode')}")
            return result
        else:
            print(f"Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"Exception: {e}")
        return None

if __name__ == "__main__":
    result = test_xaman_payload()
    print(f"Final Result: {result}")
