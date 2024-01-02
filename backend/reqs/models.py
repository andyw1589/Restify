from django.db import models
from django.utils import timezone

from accounts.models import User
from properties.models import Property


# Create your models here.
class BaseRequest(models.Model):
    status = models.CharField(max_length=50, null=False)
    created = models.DateTimeField(auto_created=True, default=timezone.now)
    type = models.CharField(null=False, max_length=50)  # either "property" or "cancellation"
    # for easy type checking i guess?

    class Meta:
        abstract = True

class PropertyRequest(BaseRequest):
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_property_requests")
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_property_requests")
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    review_completed = models.BooleanField(default=False, null=False)
    start_date = models.DateField(null=False)
    end_date = models.DateField(null=False)
    expiry_date = models.DateField(null=False)

class CancellationRequest(BaseRequest):
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_cancellation_requests")
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_cancellation_requests")
    request = models.ForeignKey(PropertyRequest, on_delete=models.CASCADE)
