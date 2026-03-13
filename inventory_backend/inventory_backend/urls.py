# from django.contrib import admin
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter

# from products.views import ProductViewSet, low_stock_products
# from customers.views import CustomerViewSet
# from billing.views import create_invoice, dashboard_stats

# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )

# # Router for ViewSets
# router = DefaultRouter()
# router.register(r'products', ProductViewSet, basename='products')
# router.register(r'customers', CustomerViewSet, basename='customers')

# urlpatterns = [

#     # Admin
#     path('admin/', admin.site.urls),

#     # JWT Authentication
#     path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

#     # Accounts
#     path('api/accounts/', include('accounts.urls')),

#     # Custom APIs
#     path('api/invoice/create/', create_invoice, name='create_invoice'),
#     path('api/dashboard/stats/', dashboard_stats, name='dashboard_stats'),
#     path('api/products/low-stock/', low_stock_products, name='low_stock_products'),

#     # Billing App
#     path('api/billing/', include('billing.urls')),

#     # Router APIs (Products, Customers)
#     path('api/', include(router.urls)),
# ]


# from django.contrib import admin
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter

# from products.views import ProductViewSet, low_stock_products
# from customers.views import CustomerViewSet
# from billing.views import create_invoice, dashboard_stats

# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )

# router = DefaultRouter()
# router.register(r'products', ProductViewSet, basename='products')
# router.register(r'customers', CustomerViewSet, basename='customers')

# urlpatterns = [

#     # Admin
#     path('admin/', admin.site.urls),

#     # JWT LOGIN
#     path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

#     # Accounts
#     path('api/accounts/', include('accounts.urls')),

#     # Router APIs
#     path('api/', include(router.urls)),

#     # Billing
#     path('api/invoice/create/', create_invoice),
#     path('api/dashboard/stats/', dashboard_stats),

#     # Extra APIs
#     path('api/products/low-stock/', low_stock_products),
# ]

from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from django.views.generic import TemplateView

from products.views import ProductViewSet, low_stock_products
from customers.views import CustomerViewSet
from billing.views import InvoiceViewSet

from accounts.views import MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'invoices', InvoiceViewSet)   # important


urlpatterns = [

    path('admin/', admin.site.urls),

    # JWT
    # path('api/token/', MyTokenObtainPairView.as_view()),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),

    # accounts
    path('api/accounts/', include('accounts.urls')),

    # billing
    path('api/billing/', include('billing.urls')),

    # router
    path('api/', include(router.urls)),

    # products
    path('api/products/low-stock/', low_stock_products),

    # React Frontend Catch-all
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]