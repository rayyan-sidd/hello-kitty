import os
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional
from datetime import date

load_dotenv()

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}

app = FastAPI(title="Fire Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

@app.get("/")
def root():
    return {"status": "Fire detection API is running"}

@app.get("/sites")
def get_sites(
    limit: int = Query(2000, le=20000),
    predicted_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    query = """
        SELECT
            id, loc_group, latitude, longitude,
            predicted_type, confidence_score, persist_days, detection_count,
            dist_to_industrial_km, dist_to_mining_km, dist_to_power_km,
            nearest_industrial_name, nearest_mining_name, nearest_power_name,
            first_detected, last_detected
        FROM sites
        WHERE 1=1
    """
    params = []

    if predicted_type:
        query += " AND predicted_type = %s"
        params.append(predicted_type)

    if start_date:
        query += " AND last_detected >= %s"
        params.append(start_date)

    if end_date:
        query += " AND first_detected <= %s"
        params.append(end_date)

    query += " ORDER BY confidence_score DESC LIMIT %s"
    params.append(limit)

    cur.execute(query, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    features = []
    for row in rows:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [row["longitude"], row["latitude"]]
            },
            "properties": {
                "id": row["id"],
                "site": row["loc_group"],
                "classification": row["predicted_type"],
                "confidence_score": row["confidence_score"],
                "persist_days": row["persist_days"],
                "detection_count": row["detection_count"],
                "dist_to_industrial_km": row["dist_to_industrial_km"],
                "dist_to_mining_km": row["dist_to_mining_km"],
                "dist_to_power_km": row["dist_to_power_km"],
                "nearest_industrial_name": row["nearest_industrial_name"],
                "nearest_mining_name": row["nearest_mining_name"],
                "nearest_power_name": row["nearest_power_name"],
                "first_detected": str(row["first_detected"]) if row["first_detected"] else None,
                "last_detected": str(row["last_detected"]) if row["last_detected"] else None,
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }