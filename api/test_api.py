import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    print("Testing /health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_categories():
    print("Testing /categories endpoint...")
    response = requests.get(f"{BASE_URL}/categories")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Categories: {data['count']} total")
    print(f"List: {data['categories'][:5]}...\n")

def test_subdistricts():
    print("Testing /subdistricts endpoint...")
    response = requests.get(f"{BASE_URL}/subdistricts")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Subdistricts: {data['count']} total")
    print(f"First 10: {data['subdistricts'][:10]}\n")

def test_predict():
    print("Testing /predict endpoint...")
    payload = {
        "subdistrict": "วังทองหลาง",
        "year": 2024,
        "month": 6,
        "day": 15
    }
    
    response = requests.post(f"{BASE_URL}/predict", json=payload)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Prediction for {data['subdistrict']} on {data['date']}:")
        print(f"Total predicted complaints: {data['total_predicted']:.2f}")
        print("\nTop 5 categories:")
        sorted_preds = sorted(data['predictions'].items(), key=lambda x: x[1], reverse=True)[:5]
        for cat, val in sorted_preds:
            print(f"  {cat}: {val:.2f}")
    else:
        print(f"Error: {response.json()}")
    print()

def test_batch_predict():
    print("Testing /predict/batch endpoint...")
    payload = [
        {
            "subdistrict": "วังทองหลาง",
            "year": 2024,
            "month": 6,
            "day": 15
        },
        {
            "subdistrict": "บางนา",
            "year": 2024,
            "month": 6,
            "day": 16
        }
    ]
    
    response = requests.post(f"{BASE_URL}/predict/batch", json=payload)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Batch predictions: {data['count']} results")
        for i, pred in enumerate(data['predictions'][:2], 1):
            if 'error' not in pred:
                print(f"\n{i}. {pred['subdistrict']} on {pred['date']}")
                print(f"   Total: {pred['total_predicted']:.2f}")
    else:
        print(f"Error: {response.json()}")
    print()

def test_invalid_subdistrict():
    print("Testing invalid subdistrict...")
    payload = {
        "subdistrict": "InvalidPlace",
        "year": 2024,
        "month": 6,
        "day": 15
    }
    
    response = requests.post(f"{BASE_URL}/predict", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")


if __name__ == "__main__":
    print("=" * 60)
    print("Bangkok Traffy Prediction API - Test Suite")
    print("=" * 60)
    print()
    
    try:
        test_health()
        test_categories()
        test_subdistricts()
        test_predict()
        test_batch_predict()
        test_invalid_subdistrict()
        
        print("=" * 60)
        print("All tests completed!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to API")
        print("Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")
