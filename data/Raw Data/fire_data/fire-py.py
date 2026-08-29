import pandas as pd
import glob

# put all 3 extracted CSVs in one folder, point this to it
csv_files = glob.glob("C:\\Users\\Roiyawn\\Desktop\\fire_data\\*.csv")

dfs = []
for file in csv_files:
    df = pd.read_csv(file)
    dfs.append(df)
    print(f"{file}: {len(df)} rows")

combined = pd.concat(dfs, ignore_index=True)
combined = combined.drop_duplicates()
combined.to_csv("firms_historical.csv", index=False)

print(f"\nTotal combined rows: {len(combined)}")