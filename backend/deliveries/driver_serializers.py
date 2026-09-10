from rest_framework import serializers

from django.contrib.auth.models import User


class DriverSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(
        source="profile.phone_number",
        read_only=True,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
        ]