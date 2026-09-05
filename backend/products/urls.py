from django.urls import path

from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    ProductCreateView,
    ProductUpdateView,
    ProductDeleteView,
    InventoryListView,
    InventoryDetailView,
    InventoryCreateView,
    InventoryUpdateView,
    InventoryDeleteView,
    CartView,
    CartItemCreateView,
    CartItemUpdateView,
    CartItemDeleteView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),

    path("products/", ProductListView.as_view(), name="product-list"),
    path(
        "products/<int:pk>/",
        ProductDetailView.as_view(),
        name="product-detail",
    ),

    path(
        "management/products/",
        ProductCreateView.as_view(),
        name="product-create",
    ),
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

    path(
        "inventory/",
        InventoryListView.as_view(),
        name="inventory-list",
    ),
    path(
        "inventory/<int:pk>/",
        InventoryDetailView.as_view(),
        name="inventory-detail",
    ),

    path(
        "management/inventory/",
        InventoryCreateView.as_view(),
        name="inventory-create",
    ),
    path(
        "management/inventory/<int:pk>/",
        InventoryUpdateView.as_view(),
        name="inventory-update",
    ),
    path(
        "management/inventory/<int:pk>/delete/",
        InventoryDeleteView.as_view(),
        name="inventory-delete",
    ),
        path(
        "cart/",
        CartView.as_view(),
        name="cart",
    ),
    path(
        "cart/items/",
        CartItemCreateView.as_view(),
        name="cart-item-create",
    ),
    path(
        "cart/items/<int:pk>/",
        CartItemUpdateView.as_view(),
        name="cart-item-update",
    ),
    path(
        "cart/items/<int:pk>/delete/",
        CartItemDeleteView.as_view(),
        name="cart-item-delete",
    ),
]