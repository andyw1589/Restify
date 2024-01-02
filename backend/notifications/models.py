from django.db import models
from accounts.models import User
from properties.models import Property
from django.utils import timezone

from properties.serializers import PropertySerializer
from reqs.serializers import *
from comments.serializers import CommentSerializer

def defaultJSON():
    return {}

# Create your models here.
class Notification(models.Model):
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="sent_notifications")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_notifications") 
    read_by_receiver = models.BooleanField(default=False, null=False)
    notif_type = models.CharField(max_length=30, null=False)
    time_sent = models.DateTimeField(default=timezone.now, null=False)
    data = models.JSONField(default=defaultJSON, null=False)


# when a property is requested
def createRequest(sender, receiver, property, start_date, end_date):
    notif = Notification.objects.create(
        sender=sender,
        receiver=receiver,
        notif_type="request",
        # data is just any extra data that may vary across notifications (too lazy to make multiple sub-models)
        data={
            "property": PropertySerializer(property).data,
            "start_date": start_date,
            "end_date": end_date
        }
    )
    notif.save()

# when a property request is updated
def createRequestUpdate(sender, receiver, request):
    notif = Notification.objects.create(
        sender=sender,
        receiver=receiver,
        notif_type="request-update",
        data={
            "request": PropertyRequestSerializer(request).data
        }
    )
    notif.save()

# when a cancellation request is created
def createCancellationRequest(sender, receiver, request):
    notif = Notification.objects.create(
        sender=sender,
        receiver=receiver,
        notif_type="request-cancellation",
        data={
            "request": PropertyRequestSerializer(request).data
        }
    )
    notif.save()

# when a cancellation request is updated
def createCancellationRequestUpdate(sender, receiver, request):
    notif = Notification.objects.create(
        sender=sender,
        receiver=receiver,
        notif_type="request-cancellation-update",
        data={
            "request": CancellationRequestSerializer(request).data
        }
    )
    notif.save()

# def createUserReview(sender, receiver, comment):
#     notif = Notification.objects.create(
#         sender=sender,
#         receiver=receiver,
#         notif_type="user-review",
#         data={
#             "comment": CommentSerializer(comment).data
#         }
#     )
#     notif.save()

def createPropertyReview(sender, receiver, comment):
    notif = Notification.objects.create(
        sender=sender,
        receiver=receiver,
        notif_type="property-review",
        data={
            "comment": CommentSerializer(comment).data,
            "property": PropertySerializer(comment.property_request.property).data
            # idk how to make it so the comment serializes the property because property_request is writable
        }
    )
    notif.save()

def createPropertyReply(sender, receiver, comment):
    notif = Notification.objects.create(
        sender=sender,
        receiver=receiver,
        notif_type="property-review-reply",
        data={
            "comment": CommentSerializer(comment).data
        }
    )
    notif.save()