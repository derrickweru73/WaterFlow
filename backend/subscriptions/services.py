from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from notifications.services import create_notification
from products.models import Order, OrderItem

from .models import Subscription


@transaction.atomic
def generate_subscription_order(subscription):
    if subscription.status != Subscription.Status.ACTIVE:
        return None

    if subscription.next_delivery_date > timezone.localdate():
        return None

    items = subscription.items.select_related(
        "product",
        "product__inventory",
    ).all()

    if not items.exists():
        return None

    for item in items:
        product = item.product
        inventory = getattr(product, "inventory", None)

        if not product.is_active:
            return None

        if inventory is None:
            return None

        if item.quantity > inventory.quantity:
            return None

    product_total = sum(
        item.product.price * item.quantity
        for item in items
    )

    delivery_fee = subscription.delivery_zone.delivery_fee

    total_amount = product_total + delivery_fee

    order = Order.objects.create(
        customer=subscription.customer,
        total_amount=total_amount,
        delivery_address=subscription.delivery_address,
        delivery_zone=subscription.delivery_zone,
        status=Order.Status.PENDING_PAYMENT,
    )

    for item in items:
        unit_price = item.product.price
        subtotal = unit_price * item.quantity

        OrderItem.objects.create(
            order=order,
            product=item.product,
            quantity=item.quantity,
            unit_price=unit_price,
            subtotal=subtotal,
        )

    if subscription.frequency == Subscription.Frequency.WEEKLY:
        days = 7
    elif subscription.frequency == Subscription.Frequency.BIWEEKLY:
        days = 14
    else:
        days = 30

    subscription.next_delivery_date += timedelta(days=days)

    subscription.save(
        update_fields=[
            "next_delivery_date",
            "updated_at",
        ]
    )

    create_notification(
        user=subscription.customer,
        title="Subscription Payment Due",
        message=f"Your recurring Order #{order.id} has been created and is ready for payment.",
        notification_type="SUBSCRIPTION",
    )

    return order