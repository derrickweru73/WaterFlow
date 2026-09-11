from django.urls import path

from .views import (
    CustomerSubscriptionListCreateView,
    CustomerSubscriptionActionView,
    ManagementSubscriptionListView,
    ManagementSubscriptionActionView,
)

urlpatterns = [
    path(
        "",
        CustomerSubscriptionListCreateView.as_view(),
        name="customer-subscription-list-create",
    ),
    path(
        "<int:pk>/action/",
        CustomerSubscriptionActionView.as_view(),
        name="customer-subscription-action",
    ),
    path(
        "management/",
        ManagementSubscriptionListView.as_view(),
        name="management-subscription-list",
    ),
    path(
        "management/<int:pk>/action/",
        ManagementSubscriptionActionView.as_view(),
        name="management-subscription-action",
    ),
]