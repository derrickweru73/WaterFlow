from django.core.management.base import BaseCommand
from django.utils import timezone

from subscriptions.models import Subscription
from subscriptions.services import generate_subscription_order


class Command(BaseCommand):
    help = "Generate orders for active subscriptions that are due."

    def handle(self, *args, **options):
        today = timezone.localdate()

        subscriptions = Subscription.objects.filter(
            status=Subscription.Status.ACTIVE,
            next_delivery_date__lte=today,
        )

        generated = 0

        for subscription in subscriptions:
            order = generate_subscription_order(subscription)

            if order:
                generated += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created order #{order.id} "
                        f"for subscription #{subscription.id}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Finished. {generated} subscription order(s) generated."
            )
        )