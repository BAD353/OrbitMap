from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
from app.core.space_track import st
import spacetrack.operators as op

def fetch_satellite_data():
    creation_date: datetime | None = None

    sync_state_path = Path("data/sync_state.json")
    data_path = Path("data/raw-historical/satellite_data.json")
    new_data_path = Path("data/raw-historical/new_satellite_data.json")

    sync_state = {"raw-historical": {"latest-epoch": None, "updated_at": None}}

    if sync_state_path.exists():
        with sync_state_path.open() as file:
            sync_state = json.load(file)
        file_creation_date = sync_state["raw-historical"]["latest-creation-date"]
        print("Detected last creation-date:", file_creation_date)
        if file_creation_date is not None:
            creation_date = datetime.fromisoformat(file_creation_date).replace(tzinfo=timezone.utc)

    today = datetime.now(timezone.utc)

    #######################

    old_json_dict_data: dict = {}  # (norad_id, epoch) ==> {full json record}
    if data_path.exists():
        with data_path.open() as file:
            old_data = json.load(file)
            old_json_dict_data = {
                (record["NORAD_CAT_ID"], record["EPOCH"]): record for record in old_data
            }

    #######################

    if creation_date is None:
        creation_date = today - timedelta(days=30)  # fetch data for 30 days

    satellite_json_dict_data = old_json_dict_data
    new_data = []

    if today - creation_date > timedelta(hours=1):
        drange = op.inclusive_range(creation_date - timedelta(hours=1), today)
        print("Fetching range", drange)
        new_str_data = st.gp_history(creation_date=drange, format="json")
        new_data = json.loads(new_str_data)
        new_json_dict_data = {
            (record["NORAD_CAT_ID"], record["EPOCH"]): record for record in new_data
        }
        satellite_json_dict_data = (
            old_json_dict_data | new_json_dict_data
        )  # new data overwrites old data

    satellite_data = list(satellite_json_dict_data.values())

    new_last_epoch = max(
        datetime.fromisoformat(record["CREATION_DATE"]) for record in satellite_data
    )

    with data_path.open("w") as file:
        json.dump(satellite_data, file, indent=4)

    with new_data_path.open("w") as file:
        json.dump(new_data, file, indent=4)


    with sync_state_path.open("w") as file:
        sync_state["raw-historical"]["latest-creation-date"] = new_last_epoch.isoformat()
        sync_state["raw-historical"]["updated_at"] = today.isoformat()
        json.dump(sync_state, file, indent=4)

    return (True, new_last_epoch, today)