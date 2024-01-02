from rest_framework.generics import ListAPIView, RetrieveAPIView, DestroyAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from accounts.serializers import *
from notifications.serializers import NotificationSerializer
from notifications.models import *
from accounts.paginations import *

# Create your views here.
class ListUserNotificationsView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ListUserNotificationsPagination

    def get_queryset(self):
        user = self.request.user
        return user.received_notifications.all().order_by('-time_sent')
    

class DisplayNotificationView(RetrieveAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        notif = get_object_or_404(Notification, id=self.kwargs["pk"])

        # you must be the receiver of the notification
        if notif.receiver != self.request.user:
            raise PermissionDenied({"message": "You don't have access to this notification.",
                                    "notification_id": self.kwargs["pk"]})

        # you've read the notif
        notif.read_by_receiver = True
        notif.save()
        
        return notif


class MarkNotificationsAsReadView(APIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ["patch"]

    def patch(self, request):
        notifs = request.user.received_notifications.all()
        for notif in notifs:
            notif.read_by_receiver = True
            notif.save()
        return Response({"data": "Marked successfully."}, status=200)
    

class DeleteNotificationView(DestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        notif = get_object_or_404(Notification, id=pk)

        if notif.receiver != request.user:
            # you must be the receiver in order to delete it
            raise PermissionDenied({"message": "You aren't the receiver of this notification",
                                    "notification_id": pk})
        
        notif.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
