import os

from django.core.validators import MinValueValidator
from django.contrib.contenttypes.fields import GenericRelation
from django.db import models
from accounts.models import User
from comments.models import Comment


# Create your models here.
class Property(models.Model):
    host = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, null=False)
    description = models.TextField(null=False)
    longitude = models.DecimalField(max_digits=20, decimal_places=10, null=False)
    latitude = models.DecimalField(max_digits=20, decimal_places=10, null=False)
    address = models.CharField(max_length=100, null=False, unique=True)
    base_price = models.PositiveIntegerField(null=False, validators=[MinValueValidator(1)])
    rating = models.DecimalField(max_digits=11, decimal_places=10, null=False, default=0)
    num_ratings = models.PositiveIntegerField(null=False, default=0)
    bedrooms = models.PositiveIntegerField(null=False)
    bathrooms = models.PositiveIntegerField(null=False)
    guest_limit = models.PositiveIntegerField(null=False)
    comments = GenericRelation(Comment, content_type_field="content_type", object_id_field="comment_to_id")


class PropertyImage(models.Model):
    image = models.ImageField(upload_to="images/", null=False)
    property = models.ForeignKey(Property, on_delete=models.CASCADE)

    # ensures the file is deleted along with the db entry
    def delete(self):
        if self.image and os.path.isfile(self.image.path):
            os.remove(self.image.path)
        super().delete()


class TimeRange(models.Model):
    start_date = models.DateField(null=False)
    end_date = models.DateField(null=False)
    property = models.ForeignKey(Property, on_delete=models.CASCADE)

    class Meta:
        abstract = True


class Unavailable(TimeRange):
    is_reservation = models.BooleanField(null=False)
    request = models.OneToOneField("reqs.PropertyRequest", null=True, on_delete=models.DO_NOTHING)


class PriceAdjustment(TimeRange):
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2, null=False)
