from rest_framework.permissions import BasePermission

from accounts.models import UserProfile


class IsManagement(BasePermission):
    """
    Allows access only to authenticated users with the MANAGEMENT role.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "profile")
            and request.user.profile.role == UserProfile.Role.MANAGEMENT
        )