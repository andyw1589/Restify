from rest_framework import serializers
from django.shortcuts import get_object_or_404

import notifications
from accounts.serializers import BasicUserInfoSerializer
from properties.serializers import PropertyTitleSerializer
from reqs.models import *
from properties.models import Unavailable


def requestWithinUnavailabilities(data, unavailabilities):
    for unavailability in unavailabilities:
        # check any overlap with requested time and the unavailable range
        if unavailability.start_date <= data["start_date"] <= unavailability.end_date or \
        unavailability.start_date <= data["end_date"] <= unavailability.end_date:
            return True
    return False

class PropertyRequestSerializer(serializers.ModelSerializer):
    receiver = BasicUserInfoSerializer(read_only=True)
    requester = BasicUserInfoSerializer(read_only=True)
    property = PropertyTitleSerializer(read_only=True)
    class Meta:
        model = PropertyRequest 
        fields = "__all__"
        extra_kwargs = {
            "receiver": {"read_only": True},
            "requester": {"read_only": True},
            "property": {"read_only": True},  # should be specified by kwargs
            "status": {"read_only": True},
            "created": {"read_only": True},
            "type": {"read_only": True}
        }

    def validate(self, data):
        property = get_object_or_404(Property, id=self.context["view"].kwargs["pk"])

        # start date must be <= end date
        if data["end_date"] < data["start_date"]:
            raise serializers.ValidationError({
                "end_date": "End date must be on or after start date."
            })
        
        # property must be available during the requested time
        if requestWithinUnavailabilities(data, property.unavailable_set.all()):
            raise serializers.ValidationError({
                "property": "This property is not available at the requested time."
            })
        
        return data

    def create(self, data):
        # create the request
        data["requester"] = self.context["request"].user
        data["property"] = get_object_or_404(Property, id=self.context["view"].kwargs["pk"])
        data["receiver"] = data["property"].host
        data["status"] = "pending"
        data["type"] = "property"

        # must also create the corresponding notification
        notifications.models.createRequest(
            sender = data["requester"],
            receiver = data["receiver"],
            property=data["property"],
            start_date=data["start_date"].strftime("%m/%d/%Y, %H:%M:%S"),
            end_date=data["end_date"].strftime("%m/%d/%Y, %H:%M:%S")
        )

        return super().create(data)

class CancellationRequestSerializer(serializers.ModelSerializer):
    receiver = BasicUserInfoSerializer(read_only=True)
    requester = BasicUserInfoSerializer(read_only=True)
    request = PropertyRequestSerializer(read_only=True)
    
    class Meta:
        model = CancellationRequest 
        fields = "__all__"
        extra_kwargs = {
            "receiver": {"read_only": True},
            "requester": {"read_only": True},
            "request": {"read_only": True},
            "status": {"read_only": True},
            "created": {"read_only": True},
            "type": {"read_only": True}
        }

    def validate(self, data):
        req = get_object_or_404(PropertyRequest, id=self.context["view"].kwargs["pk"])

        # request must be approved
        if req.status != "approved":
             raise serializers.ValidationError({
                "property": "This reservation has not been approved yet."
            })

        data["request"] = req
        
        return data

    def create(self, data):
        # create the request
        data["requester"] = self.context["request"].user
        data["receiver"] = data["request"].receiver
        data["status"] = "pending"
        data["type"] = "cancellation"
        data["request"].status = "pending cancellation"
        data["request"].save()

        # must also create the corresponding notification
        notifications.models.createCancellationRequest(
            sender=data["requester"],
            receiver=data["receiver"],
            request=data["request"]
        )

        return super().create(data)
