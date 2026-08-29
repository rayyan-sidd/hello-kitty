import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN

# ---- Step 1: Load data ----
df = pd.read_csv("C:\\Users\\Roiyawn\\Desktop\\HELLO_KITTY\\data\\CleanedData\\firms_with_distances.csv")
print(f"Loaded {len(df)} rows")

# ---- Step 2: Cluster nearby points into the same "site" ----
# DBSCAN groups points within eps distance of each other.
# eps is in degrees here (~0.01 degrees ≈ 1.1 km at the equator) —
# adjust if you want tighter/looser grouping.
coords = df[["latitude", "longitude"]].values

db = DBSCAN(eps=0.01, min_samples=1, metric="euclidean")
df["site_cluster_id"] = db.fit_predict(coords)

print(f"Found {df['site_cluster_id'].nunique()} unique sites")

# ---- Step 3: Compute persistence + summary stats per site ----
site_summary = df.groupby("site_cluster_id").agg(
    latitude=("latitude", "mean"),
    longitude=("longitude", "mean"),
    persistence_days=("acq_date", "nunique"),      # how many distinct days this site was seen
    first_detected=("acq_date", "min"),
    last_detected=("acq_date", "max"),
    total_detections=("acq_date", "count"),         # total rows (can be >1 per day, multiple satellite passes)
    avg_brightness=("brightness", "mean"),
    avg_frp=("frp", "mean"),
    avg_confidence_weight=("confidence_weight", "mean"),
    dist_to_industrial_km=("dist_to_industrial_km", "min"),
    dist_to_mining_km=("dist_to_mining_km", "min"),
    dist_to_power_km=("dist_to_power_km", "min"),
    nearest_industrial_name=("nearest_industrial_name", "first"),
).reset_index()

# ---- Step 4: Save output ----
site_summary.to_csv("sites_with_persistence.csv", index=False)
print(f"Saved sites_with_persistence.csv with {len(site_summary)} sites")

# ---- Quick sanity check ----
print("\nPersistence distribution:")
print(site_summary["persistence_days"].describe())

print("\nTop 10 most persistent sites (likely industrial):")
print(site_summary.sort_values("persistence_days", ascending=False)
      [["latitude", "longitude", "persistence_days", "dist_to_industrial_km", "nearest_industrial_name"]]
      .head(10))