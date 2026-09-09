from django.db import transaction

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

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
            return Response(
                {
                    "ResultCode": 1,
                    "ResultDesc": "Payment not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if result_code != 0:
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status", "updated_at"])

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

            order = payment.order
            order.status = Order.Status.PAID
            order.save(update_fields=["status", "updated_at"])

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

        return Response(
            {
                "ResultCode": 0,
                "ResultDesc": "Payment processed successfully",
            }
        )