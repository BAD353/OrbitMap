from db import pool
from datetime import datetime

def get_all_latest_elsets(last_update_date: datetime | None):
    with pool.connection() as conn:
        query= """
        SELECT 
            norad_id,
            EXTRACT(EPOCH FROM epoch)::float8 AS epoch,
            inclination,
            right_ascension,
            eccentricity,
            perigee_argument,
            mean_anomaly,
            mean_motion,
            b_star,
            rev_num_at_epoch,

            mean_motion_dot,
            mean_motion_ddot,
            EXTRACT(EPOCH FROM creation_date)::float8 AS creation_date,
            gp_id,
            semimajor_axis,
            period,
            apoapsis,
            periapsis,
            EXTRACT(EPOCH FROM updated_at)::float8 AS updated_at
        FROM current_elsets        
"""

        if last_update_date is None:
            db_elsets = conn.execute(query).fetchall()
        else:
            db_elsets = conn.execute(
                query+"WHERE updated_at >= %s", 
                (last_update_date, )
            ).fetchall()

        
        return db_elsets
