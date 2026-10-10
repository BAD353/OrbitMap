from psycopg_pool import ConnectionPool
from dotenv import load_dotenv
import os

load_dotenv(".env")
load_dotenv(".env.local")

pool = ConnectionPool(
    conninfo=os.environ["POSTGRES_URL"],
    min_size=2,
    max_size=10
)
