import requests

headers = {"User-Agent": "SIH2026-FireDetection/1.0"}

query = """
[out:json][timeout:90];
(
  node["landuse"="industrial"](6,68,37,97);
  way["landuse"="industrial"](6,68,37,97);
  node["man_made"="works"](6,68,37,97);
  node["industrial"](6,68,37,97);
  node["power"="plant"](6,68,37,97);
);
out center;
"""

response = requests.post(
    "https://overpass.kumi.systems/api/interpreter",
    data={"data": query},
    headers=headers
)

with open("osm_industrial.json", "w") as f:
    f.write(response.text)

print("Saved osm_industrial.json")
print("Status code:", response.status_code)
# print("Status code:", response.status_code)
print("Response body:", response.text[:500])