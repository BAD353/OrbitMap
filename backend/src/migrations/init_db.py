from app.ingestion.update_satellite_data.update_satellite_data import update_satellite_data
import psycopg
from datetime import datetime, timezone
from pathlib import Path
from db import pool

def initialize_db():
    init_sql = Path("src/migrations/initial_schema.sql").read_text()

    try:
        with pool.connection() as conn:
            conn.execute(init_sql)
            seeded_row = conn.execute("SELECT seeded FROM database_state").fetchone()
            print("Updating...")
            success, last_creation_date = update_satellite_data(conn, not seeded_row[0]) # success == False means no update was needed 
            if success:
                print("Postgres seeded")
                conn.execute("""
                    UPDATE database_state 
                    SET seeded = true, 
                        updated_at = %s,
                        last_creation_date = %s
                    WHERE id = true
                """,
                (datetime.now(timezone.utc), last_creation_date)
                )
        print("Posgres Initialized")
    except psycopg.Error as e:
        print("Postgres Inialization Error", e)
        raise 
