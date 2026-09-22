from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .serializers import RegisterSerializer


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


class FixManagementProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.username != "admin":
            return Response(
                {"detail": "Not authorized."},
                status=status.HTTP_403_FORBIDDEN,
            )

        profile, created = UserProfile.objects.get_or_create(
            user=request.user
        )

        profile.role = UserProfile.Role.MANAGEMENT
        profile.save()

        return Response({
            "message": "Management profile configured successfully.",
            "username": request.user.username,
            "role": profile.role,
            "profile_created": created,
        })