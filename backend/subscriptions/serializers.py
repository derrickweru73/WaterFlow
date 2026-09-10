from rest_framework import serializers

from .models import Subscription, SubscriptionItem


class SubscriptionItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    class Meta:
        model = SubscriptionItem
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    items = SubscriptionItemSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Subscription
        fields = [
            "id",
            "customer",
            "delivery_address",
            "frequency",
            "status",
            "next_delivery_date",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "customer",
            "status",
            "items",
            "created_at",
            "updated_at",
        ]