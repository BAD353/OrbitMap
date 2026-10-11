from app.api.get_all_latest_elsets import get_all_latest_elsets
from fastapi import FastAPI
from migrations.init_db import initialize_db

initialize_db()

app = FastAPI()

@app.get("/")
async def root():
    return {"message" : "hello world"}

@app.get("/latest/elsets")
async def getLatestElsetData():
    return get_all_latest_elsets()
