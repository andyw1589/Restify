from django.db import models
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MaxValueValidator, MinValueValidator

# Create your models here.
class Comment(models.Model):
    comment_types = (
        ('user','user'),
        ('property','property'),
        ('comment','comment')
    )
    comment_to = models.CharField(null=False, max_length=20, choices=comment_types)
    comment_to_id = models.PositiveIntegerField()
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    content_object = GenericForeignKey('content_type', 'comment_to_id')

    property_request = models.ForeignKey("reqs.PropertyRequest", null=True, on_delete=models.DO_NOTHING)
    commenter = models.ForeignKey("accounts.User", on_delete=models.DO_NOTHING)
    publish_date = models.DateTimeField(auto_created=True, default=timezone.now)
    rating = models.IntegerField(null=True, validators=[
            MaxValueValidator(5),
            MinValueValidator(1)
        ])
    title = models.CharField(max_length=100, null=False)
    body = models.CharField(max_length=300, null=False)

    # in theory there should only be a single reply, but idk how to make it do that
    replies = GenericRelation("Comment", object_id_field="comment_to_id")

    class Meta:
        indexes = [models.Index(fields=["content_type", "comment_to_id"])]
