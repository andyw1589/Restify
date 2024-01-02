from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.contenttypes.fields import GenericRelation

from comments.models import Comment


# Create your models here.
class User(AbstractUser):
    password2 = models.CharField(max_length=128, null=False)
    phone_number = models.CharField(max_length=10, null=False)
    is_host = models.BooleanField(default=False, null=False)
    avatar = models.ImageField(upload_to="images/", null=True)
    rating = models.DecimalField(max_digits=11, default=0, decimal_places=10, null=False)
    num_ratings = models.PositiveIntegerField(default=0, null=False)
    # date_joined is apparently from the base user? so that's cool
    comments = GenericRelation(Comment, content_type_field="content_type", object_id_field="comment_to_id")

    def __str__(self):
        return f"id={self.id}, username={self.username}, email={self.email}, " + \
        f"name={self.first_name} {self.last_name}, phone_number={self.phone_number}"