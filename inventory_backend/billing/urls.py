from django.urls import path
from .views import (
    create_invoice,
    monthly_sales_report,
    customer_report,
    get_invoices,
    download_invoice_pdf,
    dashboard_stats
)

urlpatterns = [
    path('invoices/', get_invoices),   # GET invoices
    path('create/', create_invoice),   # POST create invoice
    path('download-pdf/<int:pk>/', download_invoice_pdf), # PDF Download
    path('reports/monthly-sales/', monthly_sales_report),
    path('reports/customers/', customer_report),
    path('dashboard/stats/', dashboard_stats),
]