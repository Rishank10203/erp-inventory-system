from django.db import models
from django.core.validators import RegexValidator

class Customer(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True) 
    phone = models.CharField(
        max_length=15, 
        unique=True,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', "Enter a valid phone number.")]
    )
    address = models.TextField()
    gst_number = models.CharField(
        max_length=15, 
        blank=True, 
        null=True,
        validators=[RegexValidator(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$', "Enter a valid 15-digit GST number.")]
    )

    def __str__(self):
        return self.name