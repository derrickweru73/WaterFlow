from rest_framework import serializers

from .models import Order, OrderItem, Payment
from deliveries.google_maps import search_place


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

    delivery_zone_name = serializers.CharField(
        source="delivery_zone.name",
        read_only=True
    )

    delivery_fee = serializers.DecimalField(
        source="delivery_zone.delivery_fee",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    payment_status = serializers.CharField(
    source="payment.status",
    read_only=True
   )

    delivery_place = serializers.CharField(
        write_only=True,
        required=True
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
            "payment_status",
            "delivery_place",
            "delivery_address",
            "delivery_instructions",
            "delivery_zone",
            "delivery_zone_name",
            "delivery_fee",
            "latitude",
            "longitude",
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
            "delivery_address",
            "delivery_zone_name",
            "delivery_fee",
            "latitude",
            "longitude",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        delivery_place = validated_data.pop("delivery_place")

        google_result = search_place(delivery_place)

        if not google_result or not google_result.get("formatted_address"):
            raise serializers.ValidationError({
                "delivery_place": "The delivery place could not be found on Google Maps."
            })

        validated_data["delivery_address"] = google_result["formatted_address"]
        validated_data["latitude"] = google_result["latitude"]
        validated_data["longitude"] = google_result["longitude"]

        return super().create(validated_data)
