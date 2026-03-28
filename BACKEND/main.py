from fastapi import FastAPI
import pandas as pd

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset
df = pd.read_csv("data.csv")

# Calculate health score
def calculate_score(row):
    return (0.3*row['Anaemia'] +
            0.25*row['Menstrual'] +
            0.25*row['Maternal'] +
            0.2*row['Menopause'])

df["HealthScore"] = df.apply(calculate_score, axis=1)

# Risk classification
def risk_level(score):
    if score > 70:
        return "Low Risk"
    elif score > 50:
        return "Medium Risk"
    else:
        return "High Risk"

df["Risk"] = df["HealthScore"].apply(risk_level)

# Routes
@app.get("/")
def home():
    return {"message": "WHISP API running"}

@app.get("/data")
def get_data():
    return df.to_dict(orient="records")

@app.get("/insights")
def insights():
    result = []
    for _, row in df.iterrows():
        if row['Anaemia'] > 50:
            result.append(f"{row['District']}: High anaemia → increase iron programs")
        if row['Menopause'] < 25:
            result.append(f"{row['District']}: Poor menopause support → awareness needed")
    return result