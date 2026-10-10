import json


def get_tle_count_per_satellite():
    tle_count = {}
    with open("data/all_september-tle.txt", "r") as file:
        prevline = ""
        for line in file:
            if (line[0] == '1'):
                prevline = line
                continue
            satcat_id = prevline[2:8]
            satcat_id= satcat_id.replace(" ", "0")
            if (tle_count.get(satcat_id) == None):
                tle_count.update({satcat_id: 1})
            else:
                tle_count.update({satcat_id: tle_count.get(satcat_id)+1})
    print(len(tle_count.values()))
    return tle_count
        

            
            