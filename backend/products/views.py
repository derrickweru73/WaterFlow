from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated


from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem
from .cart_serializers import CartSerializer, CartItemSerializer
from .models import Category, Product, Inventory
from .permissions import IsManagement
from .serializers import CategorySerializer, ProductSerializer
from .inventory_serializers import InventorySerializer
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class ProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsManagement]


class ProductUpdateView(generics.UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsManagement]


class ProductDeleteView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsManagement]


class InventoryListView(generics.ListAPIView):
    queryset = Inventory.objects.select_related("product").all()
    serializer_class = InventorySerializer
    permission_classes = [AllowAny]


class InventoryDetailView(generics.RetrieveAPIView):
    queryset = Inventory.objects.select_related("product").all()
    serializer_class = InventorySerializer
    permission_classes = [AllowAny]


class InventoryCreateView(generics.CreateAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated, IsManagement]


class InventoryUpdateView(generics.UpdateAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated, IsManagement]


class InventoryDeleteView(generics.DestroyAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated, IsManagement]

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)

        serializer = CartSerializer(cart)

        return Response(serializer.data)


class CartItemCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)

        serializer = CartItemSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data["product"]
        quantity = serializer.validated_data["quantity"]

        inventory = getattr(product, "inventory", None)

        if inventory is None:
            return Response(
                {"detail": "This product has no inventory record."},
                status=400,
            )

        if quantity > inventory.quantity:
            return Response(
                {
                    "detail": (
                        f"Only {inventory.quantity} units are available."
                    )
                },
                status=400,
            )

        existing_item = CartItem.objects.filter(
            cart=cart,
            product=product,
        ).first()

        if existing_item:
            new_quantity = existing_item.quantity + quantity

            if new_quantity > inventory.quantity:
                return Response(
                    {
                        "detail": (
                            f"Only {inventory.quantity} units are available."
                        )
                    },
                    status=400,
                )

            existing_item.quantity = new_quantity
            existing_item.save()

            return Response(
                CartItemSerializer(existing_item).data,
                status=200,
            )

        cart_item = serializer.save(cart=cart)

        return Response(
            CartItemSerializer(cart_item).data,
            status=201,
        )


class CartItemUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        cart = get_object_or_404(
            Cart,
            user=request.user,
        )

        cart_item = get_object_or_404(
            CartItem,
            id=pk,
            cart=cart,
        )

        quantity = request.data.get("quantity")

        if quantity is None:
            return Response(
                {"quantity": ["This field is required."]},
                status=400,
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"quantity": ["Quantity must be a valid number."]},
                status=400,
            )

        if quantity < 1:
            return Response(
                {"quantity": ["Quantity must be at least 1."]},
                status=400,
            )

        inventory = getattr(cart_item.product, "inventory", None)

        if inventory is None:
            return Response(
                {"detail": "This product has no inventory record."},
                status=400,
            )

        if quantity > inventory.quantity:
            return Response(
                {
                    "detail": (
                        f"Only {inventory.quantity} units are available."
                    )
                },
                status=400,
            )

        cart_item.quantity = quantity
        cart_item.save()

        return Response(
            CartItemSerializer(cart_item).data,
            status=200,
        )


class CartItemDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        cart = get_object_or_404(
            Cart,
            user=request.user,
        )

        cart_item = get_object_or_404(
            CartItem,
            id=pk,
            cart=cart,
        )

        cart_item.delete()

        return Response(status=204)