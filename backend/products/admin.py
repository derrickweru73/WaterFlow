from django.contrib import admin

from .models import (
    Category,
    Product,
    DeliveryZone,
    Inventory,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Payment,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "description")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "is_active", "created_at")
    list_filter = ("category", "is_active")
    search_fields = ("name", "description")


@admin.register(DeliveryZone)
class DeliveryZoneAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "area",
        "delivery_fee",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active",)
    search_fields = ("name", "area")


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ("product", "quantity", "updated_at")
    search_fields = ("product__name",)


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "created_at",
        "updated_at",
    )
    search_fields = ("user__username", "user__email")
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "unit_price",
        "subtotal",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer",
        "total_amount",
        "status",
        "delivery_zone",
        "created_at",
    )
    list_filter = (
        "status",
        "delivery_zone",
        "created_at",
    )
    search_fields = (
        "customer__username",
        "customer__email",
        "delivery_address",
    )
    readonly_fields = (
        "total_amount",
        "latitude",
        "longitude",
        "created_at",
        "updated_at",
    )
    inlines = [OrderItemInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "amount",
        "phone_number",
        "mpesa_receipt_number",
        "status",
        "created_at",
    )
    list_filter = (
        "status",
        "created_at",
    )
    search_fields = (
        "order__id",
        "phone_number",
        "mpesa_receipt_number",
        "checkout_request_id",
    )