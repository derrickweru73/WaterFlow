from django.urls import path

from .views import (
    ManagementDeliveryListView,
    ManagementDeliveryAssignView,
    DriverDeliveryListView,
    DriverDeliveryStatusUpdateView,
)

urlpatterns = [
    path(
        "management/deliveries/",
        ManagementDeliveryListView.as_view(),
        name="management-delivery-list",
    ),
    path(
        "management/deliveries/<int:pk>/assign/",
        ManagementDeliveryAssignView.as_view(),
        name="management-delivery-assign",
    ),
    path(
        "driver/deliveries/",
        DriverDeliveryListView.as_view(),
        name="driver-delivery-list",
    ),
    path(
        "driver/deliveries/<int:pk>/status/",
        DriverDeliveryStatusUpdateView.as_view(),
        name="driver-delivery-status",
    ),
]