from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    class Role(models.TextChoices):
        CUSTOMER = "CUSTOMER", "Customer"
        MANAGEMENT = "MANAGEMENT", "Management"
        DRIVER = "DRIVER", "Driver"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER
    )

    phone_number = models.CharField(
        max_length=20,
        blank=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"