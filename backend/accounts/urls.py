from django.urls import path

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView,
    ProtectedTestView,
    LogoutView,
    ManagementUserProfileListView,
    ManagementUserProfileUpdateView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),

    path("login/", TokenObtainPairView.as_view(), name="login"),

    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("protected/", ProtectedTestView.as_view(), name="protected"),

    path("logout/", LogoutView.as_view(), name="logout"),

    path(
        "management/users/",
        ManagementUserProfileListView.as_view(),
        name="management-user-list",
    ),

    path(
        "management/users/<int:pk>/",
        ManagementUserProfileUpdateView.as_view(),
        name="management-user-update",
    ),
]