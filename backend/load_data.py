import os
from dotenv import load_dotenv
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

load_dotenv()

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}

# ---- Step 1: Load the CSV ----
df = pd.read_csv("data/09_map_fires_latest.csv", low_memory=False)
print(f"Loaded {len(df)} rows from CSV")

# ---- Step 2: Select + rename only the columns our table needs ----
cols = {
    "loc_group": "loc_group",
    "latitude": "latitude",
    "longitude": "longitude",
    "predicted_type": "predicted_type",
    "confidence_score": "confidence_score",
    "persist_days": "persist_days",
    "detection_count": "detection_count",
    "frp_per_day": "frp_per_day",
    "dist_to_industrial_km": "dist_to_industrial_km",
    "dist_to_mining_km": "dist_to_mining_km",
    "dist_to_power_km": "dist_to_power_km",
    "nearest_industrial_name": "nearest_industrial_name",
    "nearest_mining_name": "nearest_mining_name",
    "nearest_power_name": "nearest_power_name",
    "prob_Agricultural_Burn": "prob_agricultural_burn",
    "prob_False_Positive": "prob_false_positive",
    "prob_Gas_Flare": "prob_gas_flare",
    "prob_Industrial_Fire": "prob_industrial_fire",
    "prob_Persistent_Industrial_Thermal_Source": "prob_persistent_industrial_thermal_source",
    "prob_Wildfire": "prob_wildfire",
}

df = df[list(cols.keys())].rename(columns=cols)

# replace NaN with None so psycopg2 inserts NULL instead of erroring
df = df.where(pd.notnull(df), None)

# ---- Step 3: Connect to Postgres ----
conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

# ---- Step 4: Clear table first (safe to rerun this script) ----
cur.execute("TRUNCATE TABLE sites RESTART IDENTITY;")

# ---- Step 5: Build insert query ----
insert_query = """
    INSERT INTO sites (
        loc_group, latitude, longitude, geom,
        predicted_type, confidence_score, persist_days, detection_count, frp_per_day,
        dist_to_industrial_km, dist_to_mining_km, dist_to_power_km,
        nearest_industrial_name, nearest_mining_name, nearest_power_name,
        prob_agricultural_burn, prob_false_positive, prob_gas_flare,
        prob_industrial_fire, prob_persistent_industrial_thermal_source, prob_wildfire
    ) VALUES %s
"""

# ---- Step 6: Prepare rows, building the geom point from lat/lon using PostGIS's ST_MakePoint ----
values = []
for _, row in df.iterrows():
    values.append((
        row["loc_group"], row["latitude"], row["longitude"],
        f"SRID=4326;POINT({row['longitude']} {row['latitude']})",  # geom as WKT text, cast below
        row["predicted_type"], row["confidence_score"], row["persist_days"],
        row["detection_count"], row["frp_per_day"],
        row["dist_to_industrial_km"], row["dist_to_mining_km"], row["dist_to_power_km"],
        row["nearest_industrial_name"], row["nearest_mining_name"], row["nearest_power_name"],
        row["prob_agricultural_burn"], row["prob_false_positive"], row["prob_gas_flare"],
        row["prob_industrial_fire"], row["prob_persistent_industrial_thermal_source"], row["prob_wildfire"]
    ))

# ---- Step 7: Insert in batches ----
execute_values(cur, insert_query, values, template=None, page_size=1000)

conn.commit()
print(f"Inserted {len(values)} rows into sites table")

cur.close()
conn.close()