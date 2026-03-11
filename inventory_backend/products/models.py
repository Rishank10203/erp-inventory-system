from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=255, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    gst_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    low_stock_limit = models.IntegerField(default=5)

    def __str__(self):
        return self.name