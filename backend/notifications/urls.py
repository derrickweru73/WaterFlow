from django.urls import path

from .views import (
    NotificationListView,
    NotificationReadView,
    ManagementNotificationListView,
    ManagementNotificationReadView,
)


urlpatterns = [
    path(
        "",
        NotificationListView.as_view(),
        name="notification-list",
    ),
    path(
        "<int:pk>/read/",
        NotificationReadView.as_view(),
        name="notification-read",
    ),
    path(
        "management/",
        ManagementNotificationListView.as_view(),
        name="management-notification-list",
    ),
    path(
        "management/<int:pk>/read/",
        ManagementNotificationReadView.as_view(),
        name="management-notification-read",
    ),
]