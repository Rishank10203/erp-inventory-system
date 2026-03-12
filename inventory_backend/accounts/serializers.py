from rest_framework import serializers, status
from django.contrib.auth.models import User
from .models import Profile

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
          profile, created = Profile.objects.get_or_create(user=self.user)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': getattr(self.user.profile, 'role', 'ADMIN'),
            'phone': getattr(self.user.profile, 'phone', 'N/A'),
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone']
        extra_kwargs = {
            'email': {'required': True}
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        phone = validated_data.pop('phone')
        user = User.objects.create_user(**validated_data)
        # Profile is usually created via signal or manually here if no signal exists
        profile, created = Profile.objects.get_or_create(user=user)
        user.profile.phone = phone
        user.profile.role = 'ADMIN'
        user.profile.save()
        return user
    
    
class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'date_joined']

    def get_role(self, obj):
        try:
            return obj.profile.role
        except Exception:
            return "ADMIN" # Default for safety

    def get_phone(self, obj):
        try:
            return obj.profile.phone
        except Exception:
            return "N/A"