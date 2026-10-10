from spacetrack import SpaceTrackClient
from dotenv import load_dotenv
import os

load_dotenv(".env")

st = SpaceTrackClient(
    identity=os.environ["SPACE_TRACK_USERNAME"],
    password=os.environ["SPACE_TRACK_PASSWORD"],
)
