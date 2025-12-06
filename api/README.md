# Bangkok Traffy Prediction API

FastAPI server for predicting complaint counts by category in Bangkok subdistricts.

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Make sure model files exist in parent directory:**
   - `bangkok_traffy_model.cbm`
   - `model_metadata.pkl`

3. **Run the server:**
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- **Interactive docs:** http://localhost:8000/docs
- **Alternative docs:** http://localhost:8000/redoc

## Endpoints

### `GET /`
Root endpoint with API information

### `GET /health`
Health check endpoint

### `GET /subdistricts`
List all valid Bangkok subdistricts

### `GET /categories`
List all prediction categories

### `POST /predict`
Make a single prediction

**Request body:**
```json
{
  "subdistrict": "วังทองหลาง",
  "year": 2024,
  "month": 6,
  "day": 15
}
```

**Response:**
```json
{
  "subdistrict": "วังทองหลาง",
  "date": "2024-06-15",
  "predictions": {
    "ถนน": 2.5,
    "ทางเท้า": 1.2,
    "แสงสว่าง": 0.8,
    ...
  },
  "total_predicted": 12.3
}
```

### `POST /predict/batch`
Make multiple predictions at once

**Request body:**
```json
[
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
```

## Example Usage

### Python
```python
import requests

url = "http://localhost:8000/predict"
data = {
    "subdistrict": "วังทองหลาง",
    "year": 2024,
    "month": 6,
    "day": 15
}

response = requests.post(url, json=data)
print(response.json())
```

### JavaScript (Fetch)
```javascript
const url = "http://localhost:8000/predict";
const data = {
  subdistrict: "วังทองหลาง",
  year: 2024,
  month: 6,
  day: 15
};

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### cURL
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "subdistrict": "วังทองหลาง",
    "year": 2024,
    "month": 6,
    "day": 15
  }'
```

## Deployment

### Production with Gunicorn
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker (Optional)
See `Dockerfile` for containerized deployment.

## Notes

- Model returns predictions for 17 complaint categories
- All predictions are non-negative (clipped at 0)
- Dates are validated (must be valid calendar dates)
- Subdistrict names must match training data exactly
