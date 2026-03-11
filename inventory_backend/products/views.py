# 

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import F

from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all().order_by('-id')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    search_fields = ['name']
    ordering_fields = ['price', 'stock', 'name']

    def perform_create(self, serializer):
        instance = serializer.save()
        # log_action(self.request.user, 'CREATE', instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        # log_action(self.request.user, 'UPDATE', instance)


@api_view(['GET'])
def low_stock_products(request):
    products = Product.objects.filter(stock__lte=F('low_stock_limit'))
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)