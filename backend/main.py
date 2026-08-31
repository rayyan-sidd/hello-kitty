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

@app.get("/summary")
def get_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    """Return live dashboard totals grouped by the model's six prediction classes."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    where = ["1=1"]
    params = []
    if start_date:
        where.append("last_detected >= %s")
        params.append(start_date)
    if end_date:
        where.append("first_detected <= %s")
        params.append(end_date)
    where_sql = " AND ".join(where)

    cur.execute(f"""
        SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE confidence_score >= 0.90) AS high_confidence,
            AVG(confidence_score) AS avg_confidence,
            MAX(last_detected) AS latest_detected
        FROM sites
        WHERE {where_sql}
    """, params)
    totals = cur.fetchone()

    cur.execute(f"""
        SELECT
            predicted_type,
            COUNT(*) AS signal_count,
            AVG(confidence_score) AS avg_confidence,
            AVG(persist_days) AS avg_persist_days
        FROM sites
        WHERE {where_sql}
        GROUP BY predicted_type
        ORDER BY signal_count DESC
    """, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {
        "total": totals["total"] or 0,
        "high_confidence": totals["high_confidence"] or 0,
        "avg_confidence": totals["avg_confidence"] or 0,
        "latest_detected": str(totals["latest_detected"]) if totals["latest_detected"] else None,
        "by_type": {
            row["predicted_type"]: {
                "count": row["signal_count"],
                "avg_confidence": row["avg_confidence"] or 0,
                "avg_persist_days": row["avg_persist_days"] or 0,
            }
            for row in rows
        },
    }

@app.get("/analytics")
def get_analytics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    """Return live analytics distributions from the sites table."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    where = ["1=1"]
    params = []
    if start_date:
        where.append("last_detected >= %s")
        params.append(start_date)
    if end_date:
        where.append("first_detected <= %s")
        params.append(end_date)
    where_sql = " AND ".join(where)

    cur.execute(f"""
        SELECT COUNT(*) AS total, AVG(confidence_score) AS avg_confidence
        FROM sites
        WHERE {where_sql}
    """, params)
    totals = cur.fetchone()

    cur.execute(f"""
        SELECT predicted_type, COUNT(*) AS count
        FROM sites
        WHERE {where_sql}
        GROUP BY predicted_type
        ORDER BY count DESC
    """, params)
    classification = cur.fetchall()

    cur.execute(f"""
        SELECT
            COUNT(*) FILTER (WHERE confidence_score >= 0.90) AS high,
            COUNT(*) FILTER (WHERE confidence_score >= 0.70 AND confidence_score < 0.90) AS medium,
            COUNT(*) FILTER (WHERE confidence_score < 0.70) AS low
        FROM sites
        WHERE {where_sql}
    """, params)
    confidence = cur.fetchone()

    cur.execute(f"""
        SELECT
            CASE
                WHEN frp_per_day < 4 THEN '0–4'
                WHEN frp_per_day < 8 THEN '4–8'
                WHEN frp_per_day < 12 THEN '8–12'
                WHEN frp_per_day < 16 THEN '12–16'
                ELSE '16+'
            END AS bucket,
            COUNT(*) AS count,
            CASE
                WHEN frp_per_day < 4 THEN 1
                WHEN frp_per_day < 8 THEN 2
                WHEN frp_per_day < 12 THEN 3
                WHEN frp_per_day < 16 THEN 4
                ELSE 5
            END AS bucket_order
        FROM sites
        WHERE {where_sql}
        GROUP BY bucket, bucket_order
        ORDER BY bucket_order
    """, params)
    intensity = cur.fetchall()

    cur.execute(f"""
        SELECT
            loc_group,
            COALESCE(
                MAX(NULLIF(nearest_industrial_name, '')),
                MAX(NULLIF(nearest_mining_name, '')),
                MAX(NULLIF(nearest_power_name, '')),
                loc_group
            ) AS label,
            COUNT(*) AS count
        FROM sites
        WHERE {where_sql}
        GROUP BY loc_group
        ORDER BY count DESC
        LIMIT 10
    """, params)
    locations = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "total": totals["total"] or 0,
        "avg_confidence": totals["avg_confidence"] or 0,
        "classification": [
            {"label": row["predicted_type"], "count": row["count"]}
            for row in classification
        ],
        "confidence_distribution": [
            {"label": "HIGH", "count": confidence["high"] or 0},
            {"label": "MEDIUM", "count": confidence["medium"] or 0},
            {"label": "LOW", "count": confidence["low"] or 0},
        ],
        "intensity_distribution": [
            {"label": row["bucket"], "count": row["count"]}
            for row in intensity
        ],
        "top_locations": [
            {"label": row["label"], "group": row["loc_group"], "count": row["count"]}
            for row in locations
        ],
    }

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
            predicted_type, confidence_score, persist_days, detection_count, frp_per_day,
            prob_agricultural_burn, prob_false_positive, prob_gas_flare,
            prob_industrial_fire, prob_persistent_industrial_thermal_source, prob_wildfire,
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
                "frp_per_day": row.get("frp_per_day"),
                "prob_agricultural_burn": row.get("prob_agricultural_burn"),
                "prob_false_positive": row.get("prob_false_positive"),
                "prob_gas_flare": row.get("prob_gas_flare"),
                "prob_industrial_fire": row.get("prob_industrial_fire"),
                "prob_persistent_industrial_thermal_source": row.get("prob_persistent_industrial_thermal_source"),
                "prob_wildfire": row.get("prob_wildfire"),
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