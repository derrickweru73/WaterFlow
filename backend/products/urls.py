from django.urls import path

from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    ProductCreateView,
    ProductUpdateView,
    ProductDeleteView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),

    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/<int:pk>/", ProductDetailView.as_view(), name="product-detail"),

    path("management/products/", ProductCreateView.as_view(), name="product-create"),
    path(
        "management/products/<int:pk>/",
        ProductUpdateView.as_view(),
        name="product-update",
    ),
    path(
        "management/products/<int:pk>/delete/",
        ProductDeleteView.as_view(),
        name="product-delete",
    ),
]