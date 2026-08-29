import pandas as pd
import geopandas as gpd


fires = pd.read_csv("fire_4m_historical.csv")

print("Fire records:", len(fires))

fire_gdf = gpd.GeoDataFrame(
    fires,
    geometry=gpd.points_from_xy(
        fires["longitude"],
        fires["latitude"]
    ),
    crs="EPSG:4326"
)

osm = gpd.read_file(
    "osm_data.geojson"
)

print("OSM features:", len(osm))


industrial = osm[
    osm["landuse"].eq("industrial")
].copy()

mining = osm[
    osm["landuse"].eq("quarry")
    | osm["man_made"].eq("mineshaft")
    | osm["activity"].eq("mining")
].copy()

power = osm[
    osm["power"].eq("plant")
].copy()

print("Industrial:", len(industrial))
print("Mining:", len(mining))
print("Power plants:", len(power))

mean_lon = fire_gdf.geometry.x.mean()
utm_zone = int((mean_lon + 180) // 6) + 1

projected_crs = f"EPSG:{32600 + utm_zone}"

print("Using projected CRS:", projected_crs)

fire_projected = fire_gdf.to_crs(projected_crs)

industrial_projected = industrial.to_crs(projected_crs)
mining_projected = mining.to_crs(projected_crs)
power_projected = power.to_crs(projected_crs)


# ---------------------------------------
# 5. Find nearest OSM feature
# ---------------------------------------

def nearest_locations(fires, sites, prefix):

    sites = sites[
        sites.geometry.notna()
        & ~sites.geometry.is_empty
    ].copy()

    # Keep the site's original geometry
    sites = sites[["geometry"]]

    result = gpd.sjoin_nearest(
        fires[["geometry"]],
        sites,
        how="left"
    )

    # After spatial join, the right-side geometry
    # is represented by the original site geometry.
    #
    # sjoin_nearest gives index_right, which we use
    # to retrieve the actual nearest site's geometry.

    nearest_geometry = sites.loc[
        result["index_right"]
    ].reset_index(drop=True)

    result = result.reset_index(drop=True)

    result[f"{prefix}_lat"] = nearest_geometry.to_crs(
        "EPSG:4326"
    ).geometry.y

    result[f"{prefix}_lon"] = nearest_geometry.to_crs(
        "EPSG:4326"
    ).geometry.x

    return result[
        [f"{prefix}_lat", f"{prefix}_lon"]
    ]


# ---------------------------------------
# 6. Calculate nearest locations
# ---------------------------------------

print("\nFinding nearest industrial sites...")

industrial_locations = nearest_locations(
    fire_projected,
    industrial_projected,
    "industrial"
)

print("Industrial complete.")


print("\nFinding nearest mining sites...")

mining_locations = nearest_locations(
    fire_projected,
    mining_projected,
    "mining"
)

print("Mining complete.")


print("\nFinding nearest power plants...")

power_locations = nearest_locations(
    fire_projected,
    power_projected,
    "power_plant"
)

print("Power plants complete.")


# ---------------------------------------
# 7. Add six columns
# ---------------------------------------

fires["industrial_lat"] = industrial_locations["industrial_lat"]
fires["industrial_lon"] = industrial_locations["industrial_lon"]

fires["mining_lat"] = mining_locations["mining_lat"]
fires["mining_lon"] = mining_locations["mining_lon"]

fires["power_plant_lat"] = power_locations["power_plant_lat"]
fires["power_plant_lon"] = power_locations["power_plant_lon"]


# ---------------------------------------
# 8. Save final CSV
# ---------------------------------------

output_file = "fire_4m_with_nearest_locations.csv"

fires.to_csv(
    output_file,
    index=False
)

print("\n==============================")
print("DONE!")
print("==============================")
print("Output:", output_file)
print("Final shape:", fires.shape)