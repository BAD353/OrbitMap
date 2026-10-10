from app.get_data import get_data
from app.get_satellite_from_all_data import get_satellite_from_all_data
from app.get_tle_count_per_satellite import get_tle_count_per_satellite
from fastapi import FastAPI
from migrations.init_db import initialize_db

initialize_db()

app = FastAPI()

@app.get("/")
async def root():
    return {"message" : "hello world"}

@app.get("/get-data")
async def getData():
    return {"data" : get_data()}

@app.get("/satellite/{norad_id}")
async def getSatelliteData(norad_id: int):
    return {"data" : get_satellite_from_all_data(norad_id)}

@app.get("/get-tle-count")
async def getTLECountPerSatellite():
    return {"data" : get_tle_count_per_satellite()}
