from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .cart_serializers import CartSerializer, CartItemSerializer
from .inventory_serializers import InventorySerializer
from .models import (
    Category,
    Product,
    Inventory,
    DeliveryZone,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Payment,
)
from .order_serializers import OrderSerializer
from .permissions import IsManagement
from .delivery_zone_serializers import DeliveryZoneSerializer
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    PaymentSerializer,
)


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

class DeliveryZoneListView(generics.ListAPIView):
    queryset = DeliveryZone.objects.filter(is_active=True)
    serializer_class = DeliveryZoneSerializer
    permission_classes = [AllowAny]


class ManagementDeliveryZoneListCreateView(generics.ListCreateAPIView):
    queryset = DeliveryZone.objects.all()
    serializer_class = DeliveryZoneSerializer
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



class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        cart = get_object_or_404(
            Cart,
            user=request.user,
        )

        cart_items = cart.items.select_related(
            "product"
        ).all()

        if not cart_items.exists():
            return Response(
                {"detail": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        delivery_address = request.data.get("delivery_address")

        if not delivery_address or not str(delivery_address).strip():
            return Response(
                {"delivery_address": ["A valid delivery address is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")

        delivery_zone_id = request.data.get("delivery_zone")

        if not delivery_zone_id:
            return Response(
                {"delivery_zone": ["A delivery zone is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        delivery_zone = get_object_or_404(
            DeliveryZone,
            id=delivery_zone_id,
            is_active=True,
        )

        products_total = 0

        for cart_item in cart_items:
            try:
                inventory = cart_item.product.inventory
            except Inventory.DoesNotExist:
                return Response(
                    {
                        "detail": (
                            f"{cart_item.product.name} is currently "
                            "unavailable."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if inventory.quantity < cart_item.quantity:
                return Response(
                    {
                        "detail": (
                            f"Not enough stock for "
                            f"{cart_item.product.name}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            products_total += (
                cart_item.product.price * cart_item.quantity
            )

        total_amount = products_total + delivery_zone.delivery_fee

        order = Order.objects.create(
            customer=request.user,
            total_amount=total_amount,
            status=Order.Status.PENDING_PAYMENT,
            delivery_address=str(delivery_address).strip(),
            delivery_zone=delivery_zone,
            latitude=latitude,
            longitude=longitude,
        )

        for cart_item in cart_items:
            unit_price = cart_item.product.price
            subtotal = unit_price * cart_item.quantity

            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                unit_price=unit_price,
                subtotal=subtotal,
            )

        cart_items.delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )

class CustomerOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(customer=self.request.user)
            .prefetch_related("items__product")
            .order_by("-created_at")
        )


class CustomerOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(customer=self.request.user)
            .prefetch_related("items__product")
        )


class ManagementOrderListView(generics.ListAPIView):
    queryset = (
        Order.objects
        .select_related("customer")
        .prefetch_related("items__product")
        .order_by("-created_at")
    )
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsManagement]


class ManagementOrderDetailView(generics.RetrieveAPIView):
    queryset = (
        Order.objects
        .select_related("customer")
        .prefetch_related("items__product")
    )
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsManagement]


class ManagementOrderStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsManagement]

    def patch(self, request, pk):
        order = get_object_or_404(
            Order,
            pk=pk,
        )

        new_status = request.data.get("status")

        valid_statuses = [
            choice[0]
            for choice in Order.Status.choices
        ]

        if new_status not in valid_statuses:
            return Response(
                {
                    "status": [
                        "Invalid order status."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = new_status
        order.save(update_fields=["status", "updated_at"])

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )

class PaymentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        order_id = request.data.get("order_id")
        phone_number = request.data.get("phone_number")

        if not order_id:
            return Response(
                {"order_id": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not phone_number:
            return Response(
                {"phone_number": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = get_object_or_404(
            Order,
            id=order_id,
            customer=request.user,
        )

        if order.status != Order.Status.PENDING_PAYMENT:
            return Response(
                {
                    "detail": (
                        "This order is not awaiting payment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Payment.objects.filter(order=order).exists():
            return Response(
                {
                    "detail": (
                        "A payment already exists for this order."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment = Payment.objects.create(
            order=order,
            amount=order.total_amount,
            phone_number=phone_number,
            status=Payment.Status.PENDING,
        )

        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_201_CREATED,
        )