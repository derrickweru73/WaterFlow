from rest_framework import serializers

from .models import Delivery


class DeliverySerializer(serializers.ModelSerializer):
    driver_username = serializers.CharField(
        source="driver.username",
        read_only=True,
    )

    order_id = serializers.IntegerField(
        source="order.id",
        read_only=True,
    )

    customer_username = serializers.CharField(
        source="order.customer.username",
        read_only=True,
    )

    class Meta:
        model = Delivery
        fields = [
            "id",
            "order_id",
            "customer_username",
            "driver",
            "driver_username",
            "status",
            "delivery_address",
            "assigned_at",
            "delivered_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "order_id",
            "customer_username",
            "driver_username",
            "assigned_at",
            "delivered_at",
            "created_at",
            "updated_at",
        ]