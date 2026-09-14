import requests
from decouple import config


GOOGLE_MAPS_API_KEY = config("GOOGLE_MAPS_API_KEY")


def search_place(place):
    """
    Search Google Maps for one place and return its address and coordinates.
    """

    url = "https://maps.googleapis.com/maps/api/geocode/json"

    params = {
        "address": place,
        "key": GOOGLE_MAPS_API_KEY,
    }

    response = requests.get(
        url,
        params=params,
        timeout=10,
    )

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


def autocomplete_places(search_text):
    """
    Return Google Places Autocomplete suggestions limited to Nairobi.
    """

    url = (
        "https://maps.googleapis.com/maps/api/place/autocomplete/json"
    )

    params = {
        "input": search_text,
        "key": GOOGLE_MAPS_API_KEY,
        "components": "country:ke",
        "location": "-1.2921,36.8219",
        "radius": 30000,
        "strictbounds": "true",
    }

    response = requests.get(
        url,
        params=params,
        timeout=10,
    )

    response.raise_for_status()

    return response.json()

def get_place_details(place_id):
    """
    Get exact address and coordinates for a selected Google place.
    """

    url = "https://maps.googleapis.com/maps/api/place/details/json"

    params = {
        "place_id": place_id,
        "fields": "formatted_address,geometry,name,place_id",
        "key": GOOGLE_MAPS_API_KEY,
    }

    response = requests.get(
        url,
        params=params,
        timeout=10,
    )

    response.raise_for_status()

    data = response.json()

    if data.get("status") != "OK":
        return {
            "google_status": data.get("status"),
            "google_error": data.get("error_message"),
        }

    result = data["result"]
    location = result["geometry"]["location"]

    return {
        "name": result.get("name"),
        "formatted_address": result.get("formatted_address"),
        "latitude": location["lat"],
        "longitude": location["lng"],
        "place_id": result.get("place_id"),
    }