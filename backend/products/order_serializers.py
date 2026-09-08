from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "unit_price",
            "subtotal",
        ]
        read_only_fields = [
            "id",
            "product_name",
            "unit_price",
            "subtotal",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    customer_username = serializers.CharField(
        source="customer.username",
        read_only=True
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "customer",
            "customer_username",
            "items",
            "total_amount",
            "status",
            "delivery_address",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "customer",
            "customer_username",
            "items",
            "total_amount",
            "status",
            "created_at",
            "updated_at",
        ]