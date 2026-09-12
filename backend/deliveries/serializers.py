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

    latitude = serializers.DecimalField(
        source="order.latitude",
        max_digits=9,
        decimal_places=6,
        read_only=True,
    )

    longitude = serializers.DecimalField(
        source="order.longitude",
        max_digits=9,
        decimal_places=6,
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
            "latitude",
            "longitude",
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
            "latitude",
            "longitude",
            "assigned_at",
            "delivered_at",
            "created_at",
            "updated_at",
        ]