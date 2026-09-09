import base64
from datetime import datetime

import requests
from decouple import config


def get_mpesa_access_token():
    consumer_key = config("MPESA_CONSUMER_KEY")
    consumer_secret = config("MPESA_CONSUMER_SECRET")

    credentials = f"{consumer_key}:{consumer_secret}"
    encoded_credentials = base64.b64encode(
        credentials.encode()
    ).decode()

    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

    response = requests.get(
        url,
        headers={
            "Authorization": f"Basic {encoded_credentials}",
        },
        timeout=30,
    )

    response.raise_for_status()

    return response.json()["access_token"]


def initiate_stk_push(phone_number, amount, account_reference):
    access_token = get_mpesa_access_token()

    shortcode = config("MPESA_SHORTCODE")
    passkey = config("MPESA_PASSKEY")
    callback_url = config("MPESA_CALLBACK_URL")

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    password = base64.b64encode(
        f"{shortcode}{passkey}{timestamp}".encode()
    ).decode()

    url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": shortcode,
        "PhoneNumber": phone_number,
        "CallBackURL": callback_url,
        "AccountReference": account_reference,
        "TransactionDesc": "WaterFlow water order",
    }

    response = requests.post(
        url,
        json=payload,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        timeout=30,
    )

    response.raise_for_status()

    return response.json()