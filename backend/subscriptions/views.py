from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product

from .models import Subscription, SubscriptionItem
from .serializers import SubscriptionSerializer


class CustomerSubscriptionListCreateView(generics.ListCreateAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Subscription.objects
            .filter(customer=self.request.user)
            .prefetch_related("items__product")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        items = self.request.data.get("items", [])

        subscription = serializer.save(
            customer=self.request.user,
            status=Subscription.Status.ACTIVE,
        )

        for item in items:
            product = get_object_or_404(
                Product,
                id=item["product"],
            )

            quantity = int(item.get("quantity", 1))

            SubscriptionItem.objects.create(
                subscription=subscription,
                product=product,
                quantity=quantity,
            )


class CustomerSubscriptionActionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        subscription = get_object_or_404(
            Subscription,
            id=pk,
            customer=request.user,
        )

        action = request.data.get("action")

        if action == "pause":
            subscription.status = Subscription.Status.PAUSED

        elif action == "resume":
            subscription.status = Subscription.Status.ACTIVE

        elif action == "cancel":
            subscription.status = Subscription.Status.CANCELLED

        else:
            return Response(
                {
                    "detail": (
                        "Invalid action. Use pause, resume, or cancel."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        subscription.save()

        return Response(
            SubscriptionSerializer(subscription).data,
            status=status.HTTP_200_OK,
        )