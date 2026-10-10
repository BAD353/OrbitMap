import json

def get_data():
    with open("data/single_data.json", "r") as file:
        data = json.load(file)

    return data