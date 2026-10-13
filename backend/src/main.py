from typing import Optional
from app.api.get_all_latest_elsets import get_all_latest_elsets
from app.api.get_all_latest_satellites import get_all_latest_satellites
from fastapi import FastAPI
from migrations.init_db import initialize_db
from datetime import datetime, timezone
from fastapi.middleware.cors import CORSMiddleware

initialize_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
)

@app.get("/")
async def root():
    return {"message" : "hello world"}

@app.get("/latest/elsets")
async def getLatestElsetData(last_update_date: Optional[float] = None):
    return get_all_latest_elsets(
        datetime.fromtimestamp(last_update_date, tz=timezone.utc) 
        if last_update_date is not None 
        else None
    )

@app.get("/latest/satellites")
async def getLatestSatelliteData(last_update_date: Optional[float] = None):
    return get_all_latest_satellites(
        datetime.fromtimestamp(last_update_date, tz=timezone.utc) 
        if last_update_date is not None 
        else None
    )