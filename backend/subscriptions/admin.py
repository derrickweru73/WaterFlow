from django.contrib import admin

from .models import Subscription, SubscriptionItem


class SubscriptionItemInline(admin.TabularInline):
    model = SubscriptionItem
    extra = 0


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer",
        "frequency",
        "status",
        "next_delivery_date",
        "created_at",
    )

    list_filter = (
        "frequency",
        "status",
        "next_delivery_date",
    )

    search_fields = (
        "customer__username",
        "customer__email",
        "delivery_address",
    )

    inlines = [SubscriptionItemInline]