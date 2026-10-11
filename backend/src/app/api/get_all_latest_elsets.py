from db import pool

def get_all_latest_elsets():
    print("All request found")
    try:
        with pool.connection() as conn:
            print("Connected, fetching")
            db_elsets = conn.execute("SELECT * FROM current_elsets").fetchall()
            print("Fetched", db_elsets[0])
            return db_elsets
    except:
        pass