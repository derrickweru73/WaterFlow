from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import UserProfile
from products.models import Order

from .models import Delivery
from .serializers import DeliverySerializer
from .driver_serializers import DriverSerializer

class ManagementDeliveryListView(generics.ListAPIView):
    queryset = (
        Delivery.objects
        .select_related(
            "order__customer",
            "driver",
        )
        .order_by("-created_at")
    )
    serializer_class = DeliverySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not hasattr(self.request.user, "profile"):
            return Delivery.objects.none()

        if self.request.user.profile.role != UserProfile.Role.MANAGEMENT:
            return Delivery.objects.none()

        return super().get_queryset()


class ManagementDeliveryAssignView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not hasattr(request.user, "profile"):
            return Response(
                {"detail": "Management access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != UserProfile.Role.MANAGEMENT:
            return Response(
                {"detail": "Management access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        delivery = get_object_or_404(
            Delivery.objects.select_related("order"),
            pk=pk,
        )

        driver_id = request.data.get("driver_id")

        if not driver_id:
            return Response(
                {"driver_id": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        driver = get_object_or_404(
            User,
            id=driver_id,
        )

        if not hasattr(driver, "profile"):
            return Response(
                {"detail": "Selected user is not a driver."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if driver.profile.role != UserProfile.Role.DRIVER:
            return Response(
                {"detail": "Selected user is not a driver."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        delivery.driver = driver
        delivery.status = Delivery.Status.ASSIGNED
        delivery.assigned_at = timezone.now()

        delivery.save(
            update_fields=[
                "driver",
                "status",
                "assigned_at",
                "updated_at",
            ]
        )

        order = delivery.order
        order.status = Order.Status.ASSIGNED
        order.save(update_fields=["status", "updated_at"])

        return Response(
            DeliverySerializer(delivery).data,
            status=status.HTTP_200_OK,
        )


class DriverDeliveryListView(generics.ListAPIView):
    serializer_class = DeliverySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not hasattr(self.request.user, "profile"):
            return Delivery.objects.none()

        if self.request.user.profile.role != UserProfile.Role.DRIVER:
            return Delivery.objects.none()

        return (
            Delivery.objects
            .filter(driver=self.request.user)
            .select_related(
                "order__customer",
                "driver",
            )
            .order_by("-created_at")
        )


class DriverDeliveryStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not hasattr(request.user, "profile"):
            return Response(
                {"detail": "Driver access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if request.user.profile.role != UserProfile.Role.DRIVER:
            return Response(
                {"detail": "Driver access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        delivery = get_object_or_404(
            Delivery,
            pk=pk,
            driver=request.user,
        )

        new_status = request.data.get("status")

        allowed_statuses = [
            Delivery.Status.OUT_FOR_DELIVERY,
            Delivery.Status.DELIVERED,
            Delivery.Status.FAILED,
        ]

        if new_status not in allowed_statuses:
            return Response(
                {"status": ["Invalid delivery status."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        delivery.status = new_status

        update_fields = [
            "status",
            "updated_at",
        ]

        if new_status == Delivery.Status.DELIVERED:
            delivery.delivered_at = timezone.now()
            update_fields.append("delivered_at")

        delivery.save(update_fields=update_fields)

        order = delivery.order

        if new_status == Delivery.Status.OUT_FOR_DELIVERY:
            order.status = Order.Status.OUT_FOR_DELIVERY

        elif new_status == Delivery.Status.DELIVERED:
            order.status = Order.Status.DELIVERED

        elif new_status == Delivery.Status.FAILED:
            order.status = Order.Status.PROCESSING

        order.save(update_fields=["status", "updated_at"])

        return Response(
            DeliverySerializer(delivery).data,
            status=status.HTTP_200_OK,
        )

class ManagementDriverListView(generics.ListAPIView):
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not hasattr(self.request.user, "profile"):
            return User.objects.none()

        if self.request.user.profile.role != UserProfile.Role.MANAGEMENT:
            return User.objects.none()

        return (
            User.objects
            .filter(profile__role=UserProfile.Role.DRIVER)
            .select_related("profile")
            .order_by("username")
        )


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .google_maps import (
    search_place,
    autocomplete_places,
    get_place_details,
)
class GooglePlaceSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        place = request.query_params.get("place")

        if not place:
            return Response(
                {"detail": "Please provide a place."},
                status=400,
            )

        result = search_place(place)

        if not result:
            return Response(
                {"detail": "Place not found."},
                status=404,
            )

        return Response(result)

    from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User

from accounts.models import UserProfile
from products.permissions import IsManagement

class ManagementDriverCreateView(APIView):
    permission_classes = [IsManagement]

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        phone_number = request.data.get("phone_number")

        if not username or not email or not password:
            return Response(
                {
                    "detail": "Username, email and password are required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )

        UserProfile.objects.create(
            user=user,
            role=UserProfile.Role.DRIVER,
            phone_number=phone_number or "",
        )

        return Response(
            {
                "message": "Driver created successfully.",
                "driver": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "phone_number": phone_number or "",
                    "role": UserProfile.Role.DRIVER,
                },
            },
            status=status.HTTP_201_CREATED,
        )

class GooglePlaceAutocompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search_text = request.query_params.get("input")

        if not search_text or not search_text.strip():
            return Response(
                {
                    "detail": "Please provide a search input."
                },
                status=400,
            )

        result = autocomplete_places(search_text.strip())

        return Response(result)

class GooglePlaceDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        place_id = request.query_params.get("place_id")

        if not place_id or not place_id.strip():
            return Response(
                {"detail": "Please provide a place_id."},
                status=400,
            )

        result = get_place_details(place_id.strip())

        if result.get("google_status") != "OK":
            return Response(
                result,
                status=404,
            )

        return Response(result)