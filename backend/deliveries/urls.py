from django.urls import path

from .views import (
    ManagementDeliveryListView,
    ManagementDeliveryAssignView,
    DriverDeliveryListView,
    DriverDeliveryStatusUpdateView,
    ManagementDriverListView,
    GooglePlaceSearchView,
    ManagementDriverCreateView,
    GooglePlaceAutocompleteView,
    GooglePlaceDetailsView,
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
    path(
    "management/drivers/",
    ManagementDriverListView.as_view(),
    name="management-driver-list",
   ),
   path("google/place-search/", GooglePlaceSearchView.as_view(), name="google-place-search"),

   path(
    "management/drivers/create/",
    ManagementDriverCreateView.as_view(),
    name="management-driver-create",
   ),
   path(
    "google/place-autocomplete/",
    GooglePlaceAutocompleteView.as_view(),
    name="google-place-autocomplete",
   ),
   path(
    "google/place-details/",
    GooglePlaceDetailsView.as_view(),
    name="google-place-details",
   ),

]