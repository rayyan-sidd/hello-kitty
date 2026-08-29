import pandas as pd

df = pd.read_csv("fire_4m_historical.csv")

print("Shape:", df.shape)
print("\nColumns:")
print(df.columns)

print("\nFirst 5 rows:")
print(df.head())

print("\nDataset Info:")
print(df.info())

print("\nMissing Values:")
print(df.isnull().sum())

print("\nDuplicate Rows:")
print(df.duplicated().sum())

print("\nType values:")
print(df["type"].value_counts(dropna=False))

print("\nConfidence values:")
print(df["confidence"].value_counts(dropna=False))

print("\nSatellite:")
print(df["satellite"].value_counts())

print("\nInstrument:")
print(df["instrument"].value_counts())