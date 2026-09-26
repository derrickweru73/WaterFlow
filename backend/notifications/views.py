from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import UserProfile
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notification = get_object_or_404(
            Notification,
            id=pk,
            user=request.user,
        )

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response(
            NotificationSerializer(notification).data,
            status=status.HTTP_200_OK,
        )


class ManagementNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile = getattr(self.request.user, "profile", None)

        if profile is None:
            return Notification.objects.none()

        if profile.role != UserProfile.Role.MANAGEMENT:
            return Notification.objects.none()

        queryset = Notification.objects.select_related(
            "user"
        ).order_by("-created_at")

        notification_type = self.request.query_params.get("type")

        if notification_type and notification_type != "ALL":
            queryset = queryset.filter(
                notification_type=notification_type.upper()
            )

        is_read = self.request.query_params.get("is_read")

        if is_read == "true":
            queryset = queryset.filter(is_read=True)
        elif is_read == "false":
            queryset = queryset.filter(is_read=False)

        search = self.request.query_params.get("search")

        if search:
            from django.db.models import Q

            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(message__icontains=search)
                | Q(user__username__icontains=search)
            )

        return queryset


class ManagementNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        profile = getattr(request.user, "profile", None)

        if profile is None:
            return Response(
                {"detail": "Management access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if profile.role != UserProfile.Role.MANAGEMENT:
            return Response(
                {"detail": "Management access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        notification = get_object_or_404(
            Notification,
            id=pk,
        )

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response(
            NotificationSerializer(notification).data,
            status=status.HTTP_200_OK,
        )