from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .serializers import RegisterSerializer, ManagementUserProfileSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class ProtectedTestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = None

        if hasattr(request.user, "profile"):
            role = request.user.profile.role

        return Response({
            "message": "JWT authentication is working",
            "username": request.user.username,
            "role": role,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"detail": "Successfully logged out."},
            status=status.HTTP_205_RESET_CONTENT,
        )


class ManagementUserProfileListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ManagementUserProfileSerializer

    def get_queryset(self):
        if not hasattr(self.request.user, "profile"):
            return UserProfile.objects.none()

        if self.request.user.profile.role != UserProfile.Role.MANAGEMENT:
            return UserProfile.objects.none()

        return UserProfile.objects.select_related("user").order_by("user__username")


class ManagementUserProfileUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ManagementUserProfileSerializer
    queryset = UserProfile.objects.select_related("user")

    def update(self, request, *args, **kwargs):
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

        profile = self.get_object()

        if "role" not in request.data:
            return Response(
                {"detail": "Role is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.data["role"] not in UserProfile.Role.values:
            return Response(
                {"detail": "Invalid role."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if profile.user_id == request.user.id:
            return Response(
                {"detail": "You cannot change your own role."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.role = request.data["role"]
        profile.save(update_fields=["role"])

        return Response(
            ManagementUserProfileSerializer(profile).data
        )