# Bangkok Traffy Predictor

AI-powered complaint prediction system for Bangkok subdistricts using CatBoost machine learning model.

## 🎯 Project Overview

This project predicts the number of complaints by category for Bangkok subdistricts using historical data from Bangkok Traffy. It includes:

- **Machine Learning Model**: CatBoost regressor with MAE of ~0.5
- **REST API**: FastAPI backend for predictions
- **Web Frontend**: Next.js application with beautiful UI

## 📊 Features

- Predict complaints across 17 categories
- Support for 178 Bangkok subdistricts
- Date-based predictions (2023-2030)
- Real-time API with GPU acceleration
- Interactive web interface

## 🏗️ Project Structure

```
project/
├── api/                          # FastAPI backend
│   ├── main.py                   # API server
│   ├── requirements.txt          # Python dependencies
│   └── README.md                 # API documentation
├── my-app/                       # Next.js frontend
│   ├── app/
│   │   └── page.tsx             # Main UI component
│   └── package.json
├── Data Preparation.ipynb        # Model training notebook
├── bangkok_traffy_model.cbm     # Trained model (not in git)
├── model_metadata.pkl            # Model metadata (not in git)
└── *.csv                        # Training data (not in git)
```

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- GPU (optional, for faster training)

### 1. API Setup

```bash
cd api
pip install -r requirements.txt
python main.py
```

API will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
cd my-app
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📝 API Endpoints

- `GET /health` - Health check
- `GET /categories` - List all complaint categories
- `GET /subdistricts` - List all Bangkok subdistricts
- `POST /predict` - Make a prediction
- `POST /predict/batch` - Batch predictions

### Example Request

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

## 🤖 Model Details

- **Algorithm**: CatBoost Regressor
- **Loss Function**: MultiRMSE
- **Features**: Subdistrict, temporal features (cyclic encoding)
- **Targets**: 17 complaint categories
- **Performance**: MAE ~0.5

### Categories Predicted

ถนน, ทางเท้า, แสงสว่าง, ความสะอาด, กีดขวาง, ท่อระบายน้ำ, น้ำท่วม, จราจร, สายไฟ, ต้นไม้, สัตว์จรจัด, เสียงรบกวน, คลอง, PM2.5, ความปลอดภัย, ป้าย, สะพาน

## 📦 Technologies Used

- **Backend**: FastAPI, CatBoost, Pandas, NumPy
- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **ML**: CatBoost, scikit-learn

## 🎓 Academic Context

This project is part of a data science course at CEDT, demonstrating:
- Data preprocessing and feature engineering
- Time series prediction
- API development
- Full-stack application deployment

## 📄 License

Educational project - All rights reserved

## 👥 Contributors

- Your Name/Team Name

## 🔗 Links

- API Documentation: http://localhost:8000/docs
- Frontend: http://localhost:3000
