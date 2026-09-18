from django.db import transaction

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from deliveries.models import Delivery
from notifications.services import create_notification

from .models import Payment, Order


class MpesaCallbackView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        callback = request.data.get("Body", {}).get(
            "stkCallback", {}
        )

        checkout_request_id = callback.get(
            "CheckoutRequestID"
        )

        result_code = callback.get("ResultCode")

        # Temporary M-Pesa debugging logs
        print("========== MPESA CALLBACK ==========")
        print("MPESA CALLBACK RECEIVED:", request.data)
        print("MPESA RESULT CODE:", result_code)
        print("MPESA CHECKOUT REQUEST ID:", checkout_request_id)
        print("====================================")

        if not checkout_request_id:
            return Response(
                {"ResultCode": 1, "ResultDesc": "Invalid callback"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payment = Payment.objects.select_related(
                "order"
            ).get(
                checkout_request_id=checkout_request_id
            )
        except Payment.DoesNotExist:
            print(
                "MPESA ERROR: Payment not found for checkout request:",
                checkout_request_id,
            )

            return Response(
                {
                    "ResultCode": 1,
                    "ResultDesc": "Payment not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        print("MPESA PAYMENT FOUND:", payment.id)
        print("MPESA ORDER:", payment.order.id)
        print("MPESA CURRENT PAYMENT STATUS:", payment.status)

        order = payment.order

        if result_code != 0:
            print(
                "MPESA PAYMENT FAILED. RESULT CODE:",
                result_code,
            )

            payment.status = Payment.Status.FAILED
            payment.save(
                update_fields=["status", "updated_at"]
            )

            create_notification(
                user=order.customer,
                title="Payment Failed",
                message=f"Payment for Order #{order.id} was not completed.",
                notification_type="PAYMENT",
            )

            return Response(
                {
                    "ResultCode": 0,
                    "ResultDesc": "Payment failed",
                }
            )

        callback_items = callback.get(
            "CallbackMetadata", {}
        ).get("Item", [])

        receipt_number = None

        for item in callback_items:
            if item.get("Name") == "MpesaReceiptNumber":
                receipt_number = item.get("Value")
                break

        print(
            "MPESA SUCCESSFUL. RECEIPT:",
            receipt_number,
        )

        with transaction.atomic():
            payment.status = Payment.Status.COMPLETED
            payment.mpesa_receipt_number = receipt_number or ""

            payment.save(
                update_fields=[
                    "status",
                    "mpesa_receipt_number",
                    "updated_at",
                ]
            )

            order.status = Order.Status.PAID

            order.save(
                update_fields=["status", "updated_at"]
            )

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

            Delivery.objects.get_or_create(
                order=order,
                defaults={
                    "delivery_address": order.delivery_address,
                    "status": Delivery.Status.PENDING,
                },
            )

            create_notification(
                user=order.customer,
                title="Payment Successful",
                message=(
                    f"Payment for Order #{order.id} was successful. "
                    f"M-Pesa receipt: {receipt_number or 'N/A'}."
                ),
                notification_type="PAYMENT",
            )

        print(
            "MPESA PAYMENT COMPLETED SUCCESSFULLY:",
            payment.id,
        )

        return Response(
            {
                "ResultCode": 0,
                "ResultDesc": "Payment processed successfully",
            }
        )