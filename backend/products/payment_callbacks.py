from datetime import timedelta

from django.db import transaction

from rest_framework.response import Response
from rest_framework.views import APIView

from deliveries.models import Delivery
from notifications.services import create_notification
from subscriptions.models import Subscription

from .models import Order, Payment


class MpesaCallbackView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        print("========== M-PESA CALLBACK RECEIVED ==========")
        print("FULL CALLBACK:", request.data)

        callback = (
            request.data
            .get("Body", {})
            .get("stkCallback", {})
        )

        checkout_request_id = callback.get(
            "CheckoutRequestID"
        )

        result_code = callback.get("ResultCode")
        result_desc = callback.get("ResultDesc")

        print("CheckoutRequestID:", checkout_request_id)
        print("ResultCode:", result_code)
        print("ResultDesc:", result_desc)

        # -------------------------------------------------
        # Validate callback
        # -------------------------------------------------
        if not checkout_request_id:
            print("ERROR: CheckoutRequestID missing")

            return Response(
                {
                    "ResultCode": 1,
                    "ResultDesc": "Invalid callback",
                },
                status=400,
            )

        # -------------------------------------------------
        # Find the payment
        # -------------------------------------------------
        try:
            payment = (
                Payment.objects
                .select_related("order")
                .get(
                    checkout_request_id=checkout_request_id
                )
            )
        except Payment.DoesNotExist:
            print(
                "ERROR: Payment not found:",
                checkout_request_id,
            )

            return Response(
                {
                    "ResultCode": 1,
                    "ResultDesc": "Payment not found",
                },
                status=404,
            )

        order = payment.order

        print("Payment ID:", payment.id)
        print("Order ID:", order.id)
        print(
            "Current Payment Status:",
            payment.status,
        )
        print(
            "Current Order Status:",
            order.status,
        )

        # -------------------------------------------------
        # Prevent duplicate callback processing
        # -------------------------------------------------
        if payment.status == Payment.Status.COMPLETED:
            print(
                "Payment already completed. "
                "Ignoring duplicate callback."
            )

            return Response(
                {
                    "ResultCode": 0,
                    "ResultDesc": (
                        "Payment already processed"
                    ),
                }
            )

        # -------------------------------------------------
        # PAYMENT FAILED / CANCELLED
        # -------------------------------------------------
        if result_code != 0:
            payment.status = Payment.Status.FAILED

            payment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            create_notification(
                user=order.customer,
                title="Payment Failed",
                message=(
                    f"Payment for Order #{order.id} "
                    "was not completed."
                ),
                notification_type="PAYMENT",
            )

            print(
                "PAYMENT FAILED:",
                result_code,
                result_desc,
            )

            return Response(
                {
                    "ResultCode": 0,
                    "ResultDesc": "Payment failed",
                }
            )

        # -------------------------------------------------
        # PAYMENT SUCCESSFUL
        # -------------------------------------------------
        callback_items = (
            callback
            .get("CallbackMetadata", {})
            .get("Item", [])
        )

        receipt_number = None

        for item in callback_items:
            if item.get("Name") == "MpesaReceiptNumber":
                receipt_number = item.get("Value")
                break

        print("M-PESA RECEIPT:", receipt_number)

        # -------------------------------------------------
        # Complete payment and order atomically
        # -------------------------------------------------
        with transaction.atomic():
            payment.status = Payment.Status.COMPLETED

            payment.mpesa_receipt_number = (
                receipt_number or ""
            )

            payment.save(
                update_fields=[
                    "status",
                    "mpesa_receipt_number",
                    "updated_at",
                ]
            )

            # ---------------------------------------------
            # Mark order as PAID
            # ---------------------------------------------
            order.status = Order.Status.PAID

            order.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            print(
                "ORDER MARKED PAID:",
                order.id,
            )

            # ---------------------------------------------
            # Deduct inventory
            # ---------------------------------------------
            for order_item in order.items.select_related(
                "product"
            ):
                inventory = order_item.product.inventory

                inventory.quantity -= order_item.quantity

                inventory.save(
                    update_fields=[
                        "quantity",
                        "updated_at",
                    ]
                )

                print(
                    "INVENTORY UPDATED:",
                    order_item.product.name,
                    "remaining:",
                    inventory.quantity,
                )

            # ---------------------------------------------
            # Create delivery
            # ---------------------------------------------
            delivery, created = (
                Delivery.objects.get_or_create(
                    order=order,
                    defaults={
                        "delivery_address": (
                            order.delivery_address
                        ),
                        "status": Delivery.Status.PENDING,
                    },
                )
            )

            print(
                "DELIVERY:",
                delivery.id,
                "created:",
                created,
            )

            # ---------------------------------------------
            # Handle subscription order safely
            # ---------------------------------------------
            subscription = getattr(
                order,
                "subscription",
                None,
            )

            if subscription:
                if (
                    subscription.frequency
                    == Subscription.Frequency.WEEKLY
                ):
                    days = 7

                elif (
                    subscription.frequency
                    == Subscription.Frequency.BIWEEKLY
                ):
                    days = 14

                else:
                    days = 30

                subscription.status = (
                    Subscription.Status.ACTIVE
                )

                subscription.next_delivery_date += (
                    timedelta(days=days)
                )

                subscription.save(
                    update_fields=[
                        "status",
                        "next_delivery_date",
                        "updated_at",
                    ]
                )

                print(
                    "SUBSCRIPTION ACTIVATED:",
                    subscription.id,
                )

                create_notification(
                    user=order.customer,
                    title="Subscription Activated",
                    message=(
                        "Your WaterFlow subscription "
                        f"#{subscription.id} is now active."
                    ),
                    notification_type="SUBSCRIPTION",
                )

            # ---------------------------------------------
            # Payment notification
            # ---------------------------------------------
            create_notification(
                user=order.customer,
                title="Payment Successful",
                message=(
                    f"Payment for Order #{order.id} "
                    "was successful. "
                    "M-Pesa receipt: "
                    f"{receipt_number or 'N/A'}."
                ),
                notification_type="PAYMENT",
            )

        print(
            "========== PAYMENT SUCCESSFULLY COMPLETED =========="
        )
        print("Payment ID:", payment.id)
        print("Order ID:", order.id)
        print("Receipt:", receipt_number)

        return Response(
            {
                "ResultCode": 0,
                "ResultDesc": (
                    "Payment processed successfully"
                ),
            }
        )
 