from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
from app.ingestion.update_satellite_data.fetch_satellite_data import fetch_satellite_data
from db import pool
from psycopg import Connection

def elset_fields(record):
    return (
        record["NORAD_CAT_ID"],
        datetime.fromisoformat(record["EPOCH"]).replace(tzinfo=timezone.utc),
        float(record["INCLINATION"]),
        float(record["RA_OF_ASC_NODE"]),
        float(record["ECCENTRICITY"]),
        float(record["ARG_OF_PERICENTER"]),
        float(record["MEAN_ANOMALY"]),
        float(record["MEAN_MOTION"]),
        float(record["BSTAR"]),
        int(record["REV_AT_EPOCH"]),
        float(record["MEAN_MOTION_DOT"]),
        float(record["MEAN_MOTION_DDOT"]),
        datetime.fromisoformat(record["CREATION_DATE"]).replace(tzinfo=timezone.utc),
        int(record["GP_ID"]),
        float(record["SEMIMAJOR_AXIS"]),
        float(record["PERIOD"]),
        float(record["APOAPSIS"]),
        float(record["PERIAPSIS"]),
    )

def update_satellite_data(conn: Connection, seeding: bool):
    last_update = conn.execute("SELECT updated_at FROM database_state WHERE id = true").fetchone()[0]
    if (not seeding and datetime.now(timezone.utc) - last_update < timedelta(hours=1)):
        return (True, False, False)

    success, last_epoch, today = fetch_satellite_data()
    if not success:
        return (False, last_epoch, today)

    satellite_data = []
    data_path = Path("data/raw-historical/new_satellite_data.json")
    if seeding:
        data_path = Path("data/raw-historical/satellite_data.json")

    if data_path.exists():
        with data_path.open() as file:
            satellite_data = json.load(file)
    else:
        return (False, last_epoch, today)


    unique_sat_data = {}

    for record in satellite_data:
        if not unique_sat_data.get(record["NORAD_CAT_ID"]) or \
            unique_sat_data.get(record["NORAD_CAT_ID"])["EPOCH"] < record["EPOCH"]:
            unique_sat_data[record["NORAD_CAT_ID"]] = record

    for record in list(unique_sat_data.values()):
        conn.execute("""
            INSERT INTO satellites (
                norad_id, name, intl_designator, country, 
                object_type, launch_date, decay_date
            )
            VALUES (
                %s, %s, %s, %s, 
                %s, %s, %s
            )
            ON CONFLICT (norad_id) DO UPDATE SET
                name = EXCLUDED.name,
                intl_designator = EXCLUDED.intl_designator,
                country = EXCLUDED.country,
                object_type = EXCLUDED.object_type,
                launch_date = EXCLUDED.launch_date,
                decay_date = EXCLUDED.decay_date
        """,
        (
            record["NORAD_CAT_ID"],
            record["OBJECT_NAME"],
            record["OBJECT_ID"],
            record["COUNTRY_CODE"],
            record["OBJECT_TYPE"],
            datetime.fromisoformat(record["LAUNCH_DATE"])
            if record["LAUNCH_DATE"] is not None
            else None,
            datetime.fromisoformat(record["DECAY_DATE"])
            if record["DECAY_DATE"] is not None
            else None
        )
        )

    for record in satellite_data:
        conn.execute("""
            INSERT INTO elsets (
                norad_id, epoch, inclination, right_ascension, 
                eccentricity, perigee_argument, mean_anomaly, mean_motion, 
                b_star, rev_num_at_epoch, mean_motion_dot, mean_motion_ddot,
                creation_date, gp_id, semimajor_axis, period,
                apoapsis, periapsis
            )
            VALUES (
                %s, %s, %s, %s, 
                %s, %s, %s, %s, 
                %s, %s, %s, %s, 
                %s, %s, %s, %s, 
                %s, %s
            )
            ON CONFLICT DO NOTHING
        """,
            elset_fields(record)
        )

    for record in list(unique_sat_data.values()):
        conn.execute("""
            INSERT INTO current_elsets (
                norad_id, epoch, inclination, right_ascension, 
                eccentricity, perigee_argument, mean_anomaly, mean_motion, 
                b_star, rev_num_at_epoch, mean_motion_dot, mean_motion_ddot,
                creation_date, gp_id, semimajor_axis, period,
                apoapsis, periapsis
            )
            VALUES (
                %s, %s, %s, %s, 
                %s, %s, %s, %s, 
                %s, %s, %s, %s, 
                %s, %s, %s, %s, 
                %s, %s
            )
            ON CONFLICT (norad_id) DO UPDATE SET
                epoch = EXCLUDED.epoch,
                inclination = EXCLUDED.inclination,
                right_ascension = EXCLUDED.right_ascension,
                eccentricity = EXCLUDED.eccentricity,
                perigee_argument = EXCLUDED.perigee_argument,
                mean_anomaly = EXCLUDED.mean_anomaly,
                mean_motion = EXCLUDED.mean_motion,
                b_star = EXCLUDED.b_star,
                rev_num_at_epoch = EXCLUDED.rev_num_at_epoch,
                mean_motion_dot = EXCLUDED.mean_motion_dot,
                mean_motion_ddot = EXCLUDED.mean_motion_ddot,
                creation_date = EXCLUDED.creation_date,
                gp_id = EXCLUDED.gp_id,
                semimajor_axis = EXCLUDED.semimajor_axis,
                period = EXCLUDED.period,
                apoapsis = EXCLUDED.apoapsis,
                periapsis = EXCLUDED.periapsis
            WHERE current_elsets.epoch < EXCLUDED.epoch
        """,
        elset_fields(record)
        )
   
    return (True, last_epoch, today)


# {
#         "CCSDS_OMM_VERS": "3.0",
#         "COMMENT": "GENERATED VIA SPACE-TRACK.ORG API",
#         "CREATION_DATE": "2026-10-04T11:26:17",
#         "ORIGINATOR": "18 SPCS",
#         "OBJECT_NAME": "PEGASUS R/B",
#         "OBJECT_ID": "2016-078J",
#         "CENTER_NAME": "EARTH",
#         "REF_FRAME": "TEME",
#         "TIME_SYSTEM": "UTC",
#         "MEAN_ELEMENT_THEORY": "SGP4",
#         "EPOCH": "2026-10-04T07:25:03.715392",
#         "MEAN_MOTION": "16.14714114",
#         "ECCENTRICITY": "0.00090930",
#         "INCLINATION": "34.9185",
#         "RA_OF_ASC_NODE": "136.2717",
#         "ARG_OF_PERICENTER": "301.4840",
#         "MEAN_ANOMALY": "58.5013",
#         "EPHEMERIS_TYPE": "0",
#         "CLASSIFICATION_TYPE": "U",
#         "NORAD_CAT_ID": "41892",
#         "ELEMENT_SET_NO": "999",
#         "REV_AT_EPOCH": "54708",
#         "BSTAR": "0.00059250000000",
#         "MEAN_MOTION_DOT": "0.00818166",
#         "MEAN_MOTION_DDOT": "0.0003952400000",
#         "SEMIMAJOR_AXIS": "6612.080",
#         "PERIOD": "89.180",
#         "APOAPSIS": "239.957",
#         "PERIAPSIS": "227.932",
#         "OBJECT_TYPE": "ROCKET BODY",
#         "RCS_SIZE": "LARGE",
#         "COUNTRY_CODE": "US",
#         "LAUNCH_DATE": "2016-12-15",
#         "SITE": "ERAS",
#         "DECAY_DATE": null,
#         "FILE": "5383016",
#         "GP_ID": "351102645",
#         "TLE_LINE0": "0 PEGASUS R/B",
#         "TLE_LINE1": "1 41892U 16078J   26277.30907078  .00818166  39524-3  59250-3 0  9994",
#         "TLE_LINE2": "2 41892  34.9185 136.2717 0009093 301.4840  58.5013 16.14714114547080"
#     }