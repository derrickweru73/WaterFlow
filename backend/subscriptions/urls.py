from django.urls import path

from .views import (
    CustomerSubscriptionListCreateView,
    CustomerSubscriptionActionView,
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
]