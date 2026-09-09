from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, Payment
from .mpesa import initiate_stk_push
from .payment_serializers import PaymentSerializer


class PaymentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        phone_number = request.data.get("phone_number")

        if not order_id:
            return Response(
                {"order_id": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not phone_number:
            return Response(
                {"phone_number": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = get_object_or_404(
            Order,
            id=order_id,
            customer=request.user,
        )

        if order.status != Order.Status.PENDING_PAYMENT:
            return Response(
                {
                    "detail": (
                        "This order is not available for payment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Payment.objects.filter(order=order).exists():
            return Response(
                {
                    "detail": (
                        "A payment already exists for this order."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment = Payment.objects.create(
            order=order,
            amount=order.total_amount,
            phone_number=phone_number,
            status=Payment.Status.PENDING,
        )

        try:
            mpesa_response = initiate_stk_push(
                phone_number=phone_number,
                amount=order.total_amount,
                account_reference=f"ORDER-{order.id}",
            )
        except Exception as exc:
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status", "updated_at"])

            return Response(
                {
                    "detail": "Failed to initiate M-Pesa payment.",
                    "error": str(exc),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        payment.checkout_request_id = mpesa_response.get(
            "CheckoutRequestID"
        )
        payment.save(
            update_fields=[
                "checkout_request_id",
                "updated_at",
            ]
        )

        return Response(
            {
                "payment": PaymentSerializer(payment).data,
                "mpesa_response": mpesa_response,
            },
            status=status.HTTP_201_CREATED,
        )