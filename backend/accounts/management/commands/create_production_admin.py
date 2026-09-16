import os

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Create the production superuser if it does not already exist."

    def handle(self, *args, **options):
        User = get_user_model()

        username = os.environ.get("ADMIN_USERNAME")
        password = os.environ.get("ADMIN_PASSWORD")
        email = os.environ.get("ADMIN_EMAIL", "")

        if not username or not password:
            self.stdout.write(
                self.style.ERROR(
                    "ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required."
                )
            )
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(
                    f"User '{username}' already exists. Nothing changed."
                )
            )
            return

        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Production superuser '{user.username}' created successfully."
            )
        )