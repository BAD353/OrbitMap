from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
from app.core.space_track import st
import spacetrack.operators as op

def fetch_satellite_data(begin_date: datetime, end_date: datetime):
    
    drange = op.inclusive_range(begin_date, end_date)
    print("Fetching data in range", drange)
    new_str_data = st.gp_history(creation_date=drange, format="json")
    new_data = json.loads(new_str_data)

    return  new_data