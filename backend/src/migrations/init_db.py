from app.ingestion.update_satellite_data.update_satellite_data import update_satellite_data
import psycopg
from pathlib import Path
from db import pool

def initialize_db():
    init_sql = Path("src/migrations/initial_schema.sql").read_text()

    try:
        with pool.connection() as conn:
            conn.execute(init_sql)
            seeded_row = conn.execute("SELECT seeded FROM database_state").fetchone()
            if seeded_row[0] == False:
                print("Seeding....")
                success, last_epoch, updated_at = update_satellite_data(conn, True)
                if success and last_epoch != False and updated_at != False:
                    print("Postgres seeded")
                    conn.execute("""
                        UPDATE database_state 
                        SET seeded = true, 
                            last_epoch = %s, 
                            updated_at = %s
                        WHERE id = true
                    """,
                    (last_epoch, updated_at))
            else:
                print("Updating....")
                success, last_epoch, updated_at = update_satellite_data(conn, True)
                if success and last_epoch != False and updated_at != False:
                    print("Postgres updated")
        print("Posgres Initialized")
    except psycopg.Error as e:
        print("Postgres Inialization Error")
        raise 
