CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    loc_group VARCHAR(50),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    geom GEOMETRY(Point, 4326),
    predicted_type VARCHAR(50),
    confidence_score FLOAT,
    persist_days INTEGER,
    detection_count INTEGER,
    frp_per_day FLOAT,
    dist_to_industrial_km FLOAT,
    dist_to_mining_km FLOAT,
    dist_to_power_km FLOAT,
    nearest_industrial_name VARCHAR(255),
    nearest_mining_name VARCHAR(255),
    nearest_power_name VARCHAR(255),
    prob_agricultural_burn FLOAT,
    prob_false_positive FLOAT,
    prob_gas_flare FLOAT,
    prob_industrial_fire FLOAT,
    prob_persistent_industrial_thermal_source FLOAT,
    prob_wildfire FLOAT
);

CREATE INDEX sites_geom_idx ON sites USING GIST (geom);