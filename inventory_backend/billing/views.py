from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncMonth
from decimal import Decimal
import uuid
from django.http import HttpResponse, FileResponse
from io import BytesIO

# ReportLab Imports
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from .models import Invoice, InvoiceItem
from products.models import Product
from customers.models import Customer
from .serializers import InvoiceSerializer
from rest_framework.viewsets import ModelViewSet

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_invoice(request):
    try:
        data = request.data
        customer_id = data.get('customer')
        items_data = data.get('items', [])

        if not customer_id or not items_data:
            return Response({"error": "Customer and items are required"}, status=400)

        customer = Customer.objects.get(id=customer_id)
        invoice = Invoice.objects.create(
            customer=customer,
            invoice_number=str(uuid.uuid4().hex[:8]).upper(),
            total_amount=0,
            gst_amount=0,
            final_amount=0
        )

        total_amount = Decimal('0.00')
        total_gst = Decimal('0.00')

        for item in items_data:
            product = Product.objects.get(id=item['product'])
            qty = int(item['quantity'])
            
            if product.stock < qty:
                raise Exception(f"Not enough stock for {product.name}")

            price = product.price
            gst_rate = product.gst_percent / Decimal('100')
            item_total = price * qty
            item_gst = item_total * gst_rate
            
            InvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                quantity=qty,
                price=price,
                gst=item_gst,
                subtotal=item_total + item_gst
            )

            product.stock -= qty
            product.save()

            total_amount += item_total
            total_gst += item_gst

        invoice.total_amount = total_amount
        invoice.gst_amount = total_gst
        invoice.final_amount = total_amount + total_gst
        invoice.save()

        return Response({"message": "Invoice created successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def download_invoice_pdf(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)
        buffer = BytesIO()
        
        # Elite PDF Layout Configuration
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4, 
            rightMargin=50, 
            leftMargin=50, 
            topMargin=50, 
            bottomMargin=50
        )
        elements = []
        styles = getSampleStyleSheet()
        
        # Elite Typography Definitions
        elite_brand = ParagraphStyle(
            'EliteBrand',
            parent=styles['Title'],
            fontSize=26,
            textColor=colors.HexColor("#1e1b4b"), # Deep Indigo-950
            alignment=0, # Left
            fontName='Helvetica-Bold',
            spaceAfter=5
        )
        
        elite_invoice_label = ParagraphStyle(
            'EliteInvoiceLabel',
            fontSize=40,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor("#f1f5f9"), # Very Light Slate
            alignment=2 # Right
        )

        elite_label = ParagraphStyle(
            'EliteLabel',
            fontSize=8,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor("#4f46e5"), # Indigo-600
            textTransform='uppercase',
            leading=12,
            spaceAfter=4
        )
        
        elite_text = ParagraphStyle(
            'EliteText',
            fontSize=10,
            fontName='Helvetica',
            textColor=colors.HexColor("#475569"), # Slate-600
            leading=14
        )

        elite_bold = ParagraphStyle(
            'EliteBold',
            parent=elite_text,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor("#1e293b") # Slate-800
        )

        # 1. Header Section: Brand vs Giant "INVOICE"
        header_data = [
            [
                [
                    Paragraph("SMART INVOICE", elite_brand),
                    Paragraph("Digital Business Solutions", elite_text)
                ],
                Paragraph("INVOICE", elite_invoice_label)
            ]
        ]
        header_table = Table(header_data, colWidths=[300, 200])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 40))

        # 2. Billing & Meta Info Section
        info_data = [
            [Paragraph("Billed To", elite_label), Paragraph("Invoice Details", elite_label)],
            [
                [
                    Paragraph(f"<b>{invoice.customer.name}</b>", elite_bold),
                    Paragraph(f"{invoice.customer.address or 'N/A'}", elite_text),
                    Paragraph(f"GSTIN: {invoice.customer.gst_number or 'N/A'}", elite_text),
                    Paragraph(f"Phone: {invoice.customer.phone or 'N/A'}", elite_text),
                ],
                [
                    Table([
                        [Paragraph("Invoice Number", elite_text), Paragraph(f"#{invoice.invoice_number}", elite_bold)],
                        [Paragraph("Date Issued", elite_text), Paragraph(f"{invoice.created_at.strftime('%d %b, %Y')}", elite_bold)],
                        [Paragraph("Time", elite_text), Paragraph(f"{invoice.created_at.strftime('%H:%M')}", elite_bold)],
                    ], colWidths=[100, 100], style=[
                        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                        ('LEFTPADDING', (0,0), (-1,-1), 0),
                    ])
                ]
            ]
        ]
        info_table = Table(info_data, colWidths=[250, 250])
        info_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 50))

        # 3. Items Table (Elite Minimalist Style)
        data = [[
            Paragraph("Description", elite_label), 
            Paragraph("Qty", elite_label), 
            Paragraph("Price", elite_label), 
            Paragraph("Tax", elite_label), 
            Paragraph("Subtotal", elite_label)
        ]]
        
        for item in invoice.items.all():
            data.append([
                Paragraph(item.product.name, elite_text),
                Paragraph(str(item.quantity), elite_text),
                Paragraph(f"Rs. {item.price:,.2f}", elite_text),
                Paragraph(f"Rs. {item.gst:,.2f}", elite_text),
                Paragraph(f"Rs. {item.subtotal:,.2f}", elite_bold)
            ])
        
        items_table = Table(data, colWidths=[200, 50, 80, 80, 90])
        items_table.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor("#1e293b")), # Header line
            ('LINEBELOW', (0, 1), (-1, -1), 0.5, colors.HexColor("#e2e8f0")), # Item lines
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('ALIGN', (1, 1), (-1, -1), 'LEFT'), 
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 30))

        # 4. Final Calculation Section (Pushed to Right)
        calc_data = [
            [Paragraph("Subtotal", elite_text), f"Rs. {invoice.total_amount:,.2f}"],
            [Paragraph("Total GST", elite_text), f"Rs. {invoice.gst_amount:,.2f}"],
            [Paragraph("Total Payable", elite_bold), Paragraph(f"<font size='14'>Rs. {invoice.final_amount:,.2f}</font>", elite_bold)]
        ]
        
        # We wrap the calc table in another table for positioning
        calc_table = Table(calc_data, colWidths=[120, 100])
        calc_table.setStyle(TableStyle([
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('LINEABOVE', (0, 2), (-1, 2), 1, colors.HexColor("#4f46e5")),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        final_table = Table([[None, calc_table]], colWidths=[280, 220])
        elements.append(final_table)
        
        # 5. Elite Footer
        elements.append(Spacer(1, 100))
        elements.append(Table([[""]], colWidths=[500], style=[('LINEBELOW', (0,0), (-1,0), 0.5, colors.HexColor("#e2e8f0"))]))
        elements.append(Spacer(1, 15))
        
        footer_text = Paragraph(
            "Thank you for choosing Smart Invoice ERP. We appreciate your business.<br/>"
            "This is a legally valid computer-generated document.",
            elite_text
        )
        elements.append(footer_text)

        doc.build(elements)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f"Invoice_{invoice.invoice_number}.pdf")

    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_invoices(request):
    invoices = Invoice.objects.all().order_by('-id')
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def monthly_sales_report(request):
    try:
        sales = Invoice.objects.annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            total_sales=Sum('final_amount'),
            invoice_count=Count('id')
        ).order_by('-month')
        return Response(list(sales))
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def customer_report(request):
    try:
        report = Customer.objects.annotate(
            total_spent=Sum('invoice__final_amount'),
            invoice_count=Count('invoice')
        ).values('id', 'name', 'total_spent', 'invoice_count').order_by('-total_spent')
        return Response(list(report))
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats(request):
    # Aggregated stats for the dashboard
    total_invoices = Invoice.objects.count()
    paid_invoices = Invoice.objects.filter(status='PAID').count()
    pending_payments = Invoice.objects.filter(status='UNPAID').count()
    total_revenue = Invoice.objects.aggregate(total=Sum('final_amount'))['total'] or 0
    total_customers = Customer.objects.count()
    
    from django.utils import timezone
    current_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_sales = Invoice.objects.filter(created_at__gte=current_month).aggregate(total=Sum('final_amount'))['total'] or 0

    return Response({
        "total_invoices": total_invoices,
        "paid_invoices": paid_invoices,
        "pending_payments": pending_payments,
        "total_revenue": total_revenue,
        "total_customers": total_customers,
        "monthly_sales": monthly_sales,
    })

class InvoiceViewSet(ModelViewSet):
    queryset = Invoice.objects.all().order_by('-id')
    serializer_class = InvoiceSerializer
    permission_classes = [AllowAny]

    def perform_destroy(self, instance):
        # Restore stock on delete
        for item in instance.items.all():
            product = item.product
            product.stock += item.quantity
            product.save()
        instance.delete()