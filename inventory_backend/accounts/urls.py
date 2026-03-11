from django.urls import path
from .views import register, user_profile, logout_view

urlpatterns = [
    path('register/', register),
    path('profile/', user_profile),
    path('logout/', logout_view),
]