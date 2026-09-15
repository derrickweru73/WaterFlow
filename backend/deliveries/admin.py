from django.contrib import admin

from .models import Delivery


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "driver",
        "status",
        "delivery_address",
        "assigned_at",
        "delivered_at",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "order__id",
        "driver__username",
        "delivery_address",
    )