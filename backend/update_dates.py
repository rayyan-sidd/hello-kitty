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

df = pd.read_csv("data/site_dates.csv")

conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

update_query = """
    UPDATE sites SET 
        first_detected = data.first_detected::date, 
        last_detected = data.last_detected::date
    FROM (VALUES %s) AS data(loc_group, first_detected, last_detected)
    WHERE sites.loc_group = data.loc_group
"""

values = list(df[["loc_group", "first_detected", "last_detected"]].itertuples(index=False, name=None))
execute_values(cur, update_query, values)

conn.commit()
print(f"Updated {cur.rowcount} rows")
cur.close()
conn.close()