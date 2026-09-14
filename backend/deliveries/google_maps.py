import requests
from decouple import config


GOOGLE_MAPS_API_KEY = config("GOOGLE_MAPS_API_KEY")


def search_place(place):
    """
    Search Google Maps for a place and return its address and coordinates.
    """

    url = "https://maps.googleapis.com/maps/api/geocode/json"

    params = {
        "address": place,
        "key": GOOGLE_MAPS_API_KEY,
    }

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()

    data = response.json()

    if data.get("status") != "OK" or not data.get("results"):
        return {
            "google_status": data.get("status"),
            "google_error": data.get("error_message"),
            "google_results": data.get("results", []),
        }

    result = data["results"][0]
    location = result["geometry"]["location"]

    return {
        "formatted_address": result["formatted_address"],
        "latitude": location["lat"],
        "longitude": location["lng"],
        "place_id": result.get("place_id"),
    }