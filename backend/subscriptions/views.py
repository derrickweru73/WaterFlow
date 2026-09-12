from django.shortcuts import get_object_or_404
from rest_framework import generics, serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import UserProfile

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

        if not isinstance(items, list) or not items:
            raise serializers.ValidationError(
                {"items": ["At least one product is required."]}
            )

        validated_items = []

        for item in items:
            product_id = item.get("product")
            quantity = item.get("quantity", 1)

            if not product_id:
                raise serializers.ValidationError(
                    {"items": ["Each item must include a product."]}
                )

            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                raise serializers.ValidationError(
                    {"items": ["Quantity must be a valid number."]}
                )

            if quantity < 1:
                raise serializers.ValidationError(
                    {"items": ["Quantity must be at least 1."]}
                )

            product = get_object_or_404(
                Product,
                id=product_id,
                is_active=True,
            )

            inventory = getattr(product, "inventory", None)

            if inventory is None:
                raise serializers.ValidationError(
                    {
                        "items": [
                            f"{product.name} has no inventory record."
                        ]
                    }
                )

            if quantity > inventory.quantity:
                raise serializers.ValidationError(
                    {
                        "items": [
                            f"Only {inventory.quantity} units of "
                            f"{product.name} are available."
                        ]
                    }
                )

            validated_items.append(
                (product, quantity)
            )

        subscription = serializer.save(
            customer=self.request.user,
            status=Subscription.Status.ACTIVE,
        )

        for product, quantity in validated_items:
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


class ManagementSubscriptionListView(generics.ListAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not hasattr(self.request.user, "profile"):
            return Subscription.objects.none()

        if self.request.user.profile.role != UserProfile.Role.MANAGEMENT:
            return Subscription.objects.none()

        return (
            Subscription.objects
            .select_related("customer")
            .prefetch_related("items__product")
            .order_by("-created_at")
        )


class ManagementSubscriptionActionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not hasattr(request.user, "profile"):
            return Response(
                {"detail": "Management access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != UserProfile.Role.MANAGEMENT:
            return Response(
                {"detail": "Management access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        subscription = get_object_or_404(
            Subscription,
            id=pk,
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