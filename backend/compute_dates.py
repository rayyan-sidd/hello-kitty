import pandas as pd

df = pd.read_csv("data/firms_with_distances.csv", low_memory=False)

df["loc_group"] = df["latitude"].round(2).astype(str) + "_" + df["longitude"].round(2).astype(str)

date_ranges = df.groupby("loc_group").agg(
    first_detected=("acq_date", "min"),
    last_detected=("acq_date", "max"),
).reset_index()

date_ranges.to_csv("data/site_dates.csv", index=False)
print(f"Saved {len(date_ranges)} site date ranges")
print(date_ranges.head())