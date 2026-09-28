from django.contrib.auth.models import User
from rest_framework import serializers

from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "phone_number",
        ]

    def create(self, validated_data):
        phone_number = validated_data.pop("phone_number", "")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )

        UserProfile.objects.create(
            user=user,
            role=UserProfile.Role.CUSTOMER,
            phone_number=phone_number,
        )

        return user


class ManagementUserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
            "role",
            "is_active",
        ]

from django.contrib.auth.models import User
from rest_framework import serializers

from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "phone_number",
        ]

    def create(self, validated_data):
        phone_number = validated_data.pop("phone_number", "")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )

        UserProfile.objects.create(
            user=user,
            role=UserProfile.Role.CUSTOMER,
            phone_number=phone_number,
        )

        return user


class ManagementUserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
            "role",
            "is_active",
        ]


class CustomerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        required=False,
    )
    email = serializers.EmailField(
        source="user.email",
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = UserProfile
        fields = [
            "username",
            "email",
            "phone_number",
            "role",
        ]
        read_only_fields = ["role"]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        if "username" in user_data:
            instance.user.username = user_data["username"]

        if "email" in user_data:
            instance.user.email = user_data["email"]

        instance.user.save()

        if "phone_number" in validated_data:
            instance.phone_number = validated_data["phone_number"]

        instance.save()

        return instance