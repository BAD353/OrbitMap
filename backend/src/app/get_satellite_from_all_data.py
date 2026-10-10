import json


def get_satellite_from_all_data(satellite_NORAD_ID):
    with open("data/all_data.json", "r") as file:
        raw_data = json.load(file)

    data = {satellite["NORAD_CAT_ID"]: satellite for satellite in raw_data}

    all_target_data = [
        satellite
        for satellite in raw_data
        if satellite["NORAD_CAT_ID"] == str(satellite_NORAD_ID)
    ]

    return all_target_data
