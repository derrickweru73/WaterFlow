from rest_framework import serializers

from .models import Inventory, Product


class InventorySerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all()
    )

    class Meta:
        model = Inventory
        fields = [
            "id",
            "product",
            "quantity",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]