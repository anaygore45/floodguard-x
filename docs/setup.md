# Installation & Local Setup Guide — FloodGuard X

## System Requirements
- **Operating System**: Windows 10/11, macOS, or Linux
- **Python**: Python 3.10+ (Anaconda / Miniconda recommended; tested on Python 3.13.5)
- **Node.js**: Node.js 18+ and npm (tested on Node 26.8.1 / npm 11.19.0)
- **Database**: SQLite (default embedded zero-configuration warehouse) or PostgreSQL / PostGIS

---

## 1. Python Environment Setup
Install the required scientific, machine learning, and geospatial libraries:

```powershell
# Using pip with Anaconda or virtual environment
pip install numpy pandas scikit-learn scipy shapely geopandas fastapi uvicorn pydantic joblib requests matplotlib nbformat nbclient pytest
```

---

## 2. Re-executing Data Acquisition & Jupyter Notebooks
All datasets and analytical models can be regenerated and audited from scratch:

```powershell
# Step 1: Download public datasets and generate manifests
python backend/download_datasets.py

# Step 2: Build and execute all 19 Jupyter notebooks sequentially
python backend/build_and_execute_notebooks.py
```

The 19 generated notebooks are stored in `notebooks/` and can be opened in JupyterLab or VS Code:
```powershell
jupyter notebook notebooks/
```

---

## 3. Running Backend Tests
Execute the automated pytest suite:
```powershell
python -m pytest tests/test_api_endpoints.py -v
```

---

## 4. Starting the FastAPI Backend
Start the backend service on port 8000:
```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation will be available at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## 5. Starting the Next.js Frontend
In a separate terminal, start the Next.js development server:
```powershell
cd frontend
npm run dev
```
Open your browser at `http://localhost:3000` to interact with the FloodGuard X application.

---

## 6. Docker Deployment (Optional)
To containerize the complete application:
```bash
docker compose up --build
```
