from db import pool
from datetime import datetime

def get_all_latest_satellites(last_update_date: datetime | None):
    with pool.connection() as conn:
        query = """
        SELECT 
            norad_id,
            name,
            intl_designator,
            country,
            object_type,
            launch_date,
            decay_date,
            EXTRACT(EPOCH FROM updated_at)::float8 AS updated_at
        FROM satellites
        """
        if last_update_date is None:
            db_satellites = conn.execute(query).fetchall()
        else:
            db_satellites = conn.execute(
                query+" WHERE updated_at >= %s", 
                (last_update_date, )).fetchall()

        
        return db_satellites
