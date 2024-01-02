from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied, ParseError
from rest_framework import serializers

import notifications.models
from accounts.serializers import BasicUserInfoSerializer
from comments.models import *
from properties.serializers import PropertySerializer
from reqs.models import *
from properties.models import *
from accounts.models import *

class CommentToSerializer(serializers.RelatedField):
    def to_representation(self, value):
        if isinstance(value, User):
            serializer = BasicUserInfoSerializer(value)
        elif isinstance(value, Property):
            serializer = PropertySerializer(value)
        elif isinstance(value, Comment):
            # this can also represent a reply of the second level (a user reply to a host reply), after which there are no more replies
            return {
                "rating": value.rating,
                "title": value.title,
                "body": value.body,
                "property": PropertySerializer(value.property_request.property).data if value.property_request else None
            }
        else:
            raise Exception('Unexpected type of context_object')
        return serializer.data
    
class ReplySerializer(serializers.RelatedField):
    def to_representation(self, value):
        # should always be instances of comments
        # this represents a reply of the first level (a host reply)
        return {
                "rating": value.rating,
                "title": value.title,
                "body": value.body,
                "replies": [CommentToSerializer(reply) for reply in value.replies.all()]
            }

class CommentSerializer(serializers.ModelSerializer):
    commenter = BasicUserInfoSerializer(read_only=True)
    content_object = CommentToSerializer(read_only=True)
    replies = ReplySerializer(many=True, read_only=True)
    class Meta:
        model = Comment
        fields = ["id", "comment_to", "comment_to_id", "commenter", "content_object", "property_request", "publish_date", "rating", "title", "body", "replies"]
        extra_kwargs = {
            "id": {"read_only": True},
            "publish_date": {"read_only": True},
            "commenter": {"read_only": True},
            "replies": {"read_only": True}
        }

    def validate(self, data):
        request = self.context["request"]
        comment_to = data["comment_to"]
        id = data["comment_to_id"]

        if comment_to == "user":
            # Host is trying to comment on a guest's profile
            if not data.get("rating"):
                raise ParseError({"rating": "This field is required."})
            data["content_type"] = User
            open_requests = PropertyRequest.objects.filter(requester=id, receiver=request.user)
            if not open_requests.exists():
                raise PermissionDenied({"message": "User has not visited your property",
                                        "user_id": id})
            user = get_object_or_404(User, id=data["comment_to_id"])
            if user.comments.filter(commenter=request.user):
                raise PermissionDenied({"message": "You have already left a review for this guest",
                                        "property_id": id})
        elif comment_to == "property":
            # Guest is trying to comment on a property
            if not data.get("rating"):
                raise ParseError({"rating": "This field is required."})
            if not data.get("property_request"):
                raise ParseError({"property_request": "This field is required."})
            data["content_type"] = Property
            if data["property_request"].status != "terminated" and data["property_request"].status != "completed":
                raise PermissionDenied({"message": "You cannot leave a review for an unfinished reservation.",
                                        "property_id": id})
            if data["property_request"].review_completed:
                raise PermissionDenied({"message": "You have already left a review for this reservation.",
                                        "property_id": id})

        elif comment_to == "comment":
            data["content_type"] = Comment
            comment = get_object_or_404(Comment, id=id)
            target_id = comment.comment_to_id
            if Comment.objects.filter(content_type=ContentType.objects.get_for_model(Comment), comment_to_id=data["comment_to_id"]).exists():
                raise PermissionDenied({"message": "This comment already has a reply",
                                        "comment_id": data["comment_to_id"]})

            if comment.comment_to == "property":
                # Host is trying to reply to a user's comment on a property
                property = get_object_or_404(Property, id=target_id)
                if property.host != request.user:
                    raise PermissionDenied({"message": "You do not own this property",
                                            "property_id": target_id})
            elif comment.comment_to == "comment":
                # User is trying to respond to a host's comment on their comment
                original_user_comment = get_object_or_404(Comment, id=comment.comment_to_id)
                if original_user_comment.commenter != request.user or comment.commenter == request.user:
                    raise PermissionDenied({"message": "You cannot reply to this comment",
                                            "comment_id": target_id})
            else: 
                raise PermissionDenied({"message": "You cannot reply to this comment",
                                        "comment_id": target_id})
        else:
            raise ParseError({"message": "Unknown comment_to, must be user, property, or comment",
                              "comment_to": comment_to})

        return data
    
    def create(self, data):
        item = data["content_type"].objects.get(id=data["comment_to_id"])
        if data["comment_to"] == "comment":
            data["rating"] = None

        comment = Comment.objects.create(
            comment_to=data["comment_to"],
            content_object=item,
            commenter=self.context["request"].user,
            property_request=data.get("property_request"),
            rating=data["rating"],
            title=data["title"],
            body=data["body"]
        )
        comment.save()

        if data["comment_to"] == "comment":
            notifications.models.createPropertyReply(
                sender=self.context["request"].user,
                receiver=Comment.objects.get(id=data["comment_to_id"]).commenter,
                comment=comment
            )
        else:
            # if data["comment_to"] == "user":
            #     notifications.models.createUserReview(
            #         sender=self.context["request"].user,
            #         receiver=User.objects.get(id=data["comment_to_id"]),
            #         comment=comment
            #     )
            if data["comment_to"] == "property":
                data["property_request"].review_completed = True
                data["property_request"].save()
                property_host = Property.objects.get(id=data["comment_to_id"]).host
                notifications.models.createPropertyReview(
                    sender=self.context["request"].user,
                    receiver=property_host,
                    comment=comment
                )
            item.rating = (item.rating*item.num_ratings+data["rating"])/(item.num_ratings+1)
            item.num_ratings += 1
            item.save()
        return comment
