from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from products.models import Order, OrderItem

from .models import Subscription


@transaction.atomic
def generate_subscription_order(subscription):
    if subscription.status != Subscription.Status.ACTIVE:
        return None

    if subscription.next_delivery_date > timezone.localdate():
        return None

    items = subscription.items.select_related("product").all()

    if not items.exists():
        return None

    total_amount = 0

    for item in items:
        total_amount += item.product.price * item.quantity

    order = Order.objects.create(
        customer=subscription.customer,
        total_amount=total_amount,
        delivery_address=subscription.delivery_address,
        status=Order.Status.PENDING_PAYMENT,
    )

    for item in items:
        OrderItem.objects.create(
            order=order,
            product=item.product,
            quantity=item.quantity,
            price=item.product.price,
        )

    if subscription.frequency == Subscription.Frequency.WEEKLY:
        days = 7
    elif subscription.frequency == Subscription.Frequency.BIWEEKLY:
        days = 14
    else:
        days = 30

    subscription.next_delivery_date += timedelta(days=days)
    subscription.save(update_fields=["next_delivery_date", "updated_at"])

    return order