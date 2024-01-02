from rest_framework import serializers

from notifications.models import Notification
from accounts.serializers import BasicUserInfoSerializer

class NotificationSerializer(serializers.ModelSerializer):
    sender = BasicUserInfoSerializer(read_only=True)
    receiver = BasicUserInfoSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = "__all__"