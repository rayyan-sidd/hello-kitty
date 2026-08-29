import geopandas as gpd

osm = gpd.read_file("osm_data.geojson")

print("Total OSM features:", len(osm))

industrial = osm[osm["landuse"] == "industrial"]
quarry = osm[osm["landuse"] == "quarry"]
power = osm[osm["power"] == "plant"]

print("\nIndustrial:", len(industrial))
print("Quarry:", len(quarry))
print("Power plants:", len(power))

print("\nOSM columns:")
print(osm.columns.tolist())

print("\nMining-related columns:")
for column in ["resource", "activity", "man_made", "mineshaft_type"]:
    if column in osm.columns:
        print(f"\n{column}:")
        print(osm[column].value_counts(dropna=False).head(20))

print("\nOSM CRS:")
print(osm.crs)