import decimal

from rest_framework import serializers
from django.shortcuts import get_object_or_404
from rest_framework.fields import DateField, IntegerField, CharField, ChoiceField

from accounts.serializers import UserSerializer
from properties.models import *


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ["id", "image"]
        extra_kwargs = {
            "id": {"read_only": True}
        }

    def create(self, data):
        prop_pk = self.context["view"].kwargs["pk"]
        property = get_object_or_404(Property, id=prop_pk)
        data["property"] = property
        return super().create(data)

class PropertyTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ["id", "title"]

class UnavailableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unavailable
        fields = ["id", "start_date", "end_date", "is_reservation", "request"]
        extra_kwargs = {
            "id": {"read_only": True},
            "is_reservation": {"read_only": True},
            "request": {"read_only": True}
        }

    def validate(self, data):
        # end_date must be > start_date
        if data["end_date"] <= data["start_date"]:
            raise serializers.ValidationError({
                "end_date": "End date must be on or after start date."
            })
        pk = self.context['view'].kwargs.get('pk')
        property = get_object_or_404(Property, id=pk)

        start = self.context['request'].data.get("start_date")
        end = self.context['request'].data.get("end_date")

        curr_unavail = property.unavailable_set.all()
        overlap = curr_unavail.filter(start_date__lte=end).filter(end_date__gte=start).exists()

        if overlap:
            raise serializers.ValidationError("Proposed unavailable range overlaps with existing range.")
        return data

    def create(self, data):
        prop_pk = self.context["view"].kwargs["pk"]
        property = get_object_or_404(Property, id=prop_pk)
        data["property"] = property

        user = self.context["request"].user

        if property.host == user:
            # Delisting the property
            data["is_reservation"] = False
        else:
            data["is_reservation"] = True

        return super().create(data)


class PriceAdjustmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceAdjustment
        fields = ["id", "start_date", "end_date", "price_per_night"]
        extra_kwargs = {
            "id": {"read_only": True}
        }

    def validate(self, data):
        # end_date must be >= start_date
        if data["end_date"] < data["start_date"]:
            raise serializers.ValidationError({
                "end_date": "End date must be on or after start date."
            })

        # price must be >= 0
        if data["price_per_night"] < 0:
            raise serializers.ValidationError({
                "price_per_night": "Price cannot be negative."
            })

        pk = self.context['view'].kwargs.get('pk')
        property = get_object_or_404(Property, id=pk)

        start = self.context['request'].data.get("start_date")
        end = self.context['request'].data.get("end_date")

        curr_price_adj = property.priceadjustment_set.all()
        overlap = curr_price_adj.filter(start_date__lte=end).filter(end_date__gte=start).exists()

        if overlap:
            raise serializers.ValidationError("Proposed price adjustment range overlaps with existing range.")

        return data

    def create(self, data):
        prop_pk = self.context["view"].kwargs["pk"]
        property = get_object_or_404(Property, id=prop_pk)
        data["property"] = property
        return super().create(data)


class PropertySerializer(serializers.ModelSerializer):
    # from https://stackoverflow.com/questions/14573102/how-do-i-include-related-model-fields-using-django-rest-framework
    propertyimage_set = PropertyImageSerializer(many=True, required=False)
    unavailable_set = UnavailableSerializer(many=True, required=False)
    priceadjustment_set = PriceAdjustmentSerializer(many=True, required=False)
    distance = serializers.SerializerMethodField()
    host = UserSerializer(read_only=True)

    def get_distance(self, obj):
        try:
            return obj.distance
        except:
            return None

    class Meta:
        model = Property
        fields = '__all__'

        extra_kwargs = {
            "id": {"read_only": True},
            "host": {"read_only": True},
            "rating": {"read_only": True},
            "num_ratings": {"read_only": True},
            "propertyimage_set": {"read_only": True},
            "unavailable_set": {"read_only": True},
            "priceadjustment_set": {"read_only": True}
        }

    def create(self, data):
        request = self.context["request"]
        data["host"] = request.user

        # user should be a host
        request.user.is_host = True
        request.user.save()
        return super().create(data)


class ListPropertiesSerializer(serializers.Serializer):
    check_in = DateField(required=False)
    check_out = DateField(required=False)
    num_guests = IntegerField(required=False)
    min_price = IntegerField(required=False)
    max_price = IntegerField(required=False)
    location = CharField(required=False)
    sort_by = ChoiceField(required=False, choices=(
        ("distance", "distance"),
        ("rating", "rating"),
        ("price_highest", "price_highest"),
        ("price_lowest", "price_lowest")
    ))

    def validate(self, data):
        loc = data.get('location')
        if loc:
            try:
                if "," in loc:
                    loc = loc.split(",", 1)
                elif "%2C" in loc:
                    loc = loc.split("%2C", 1)
                loc = [decimal.Decimal(loc[0]), decimal.Decimal(loc[1])]
                if not (-90 <= loc[0] <= 90):
                    raise serializers.ValidationError("Latitude must be in the range [-90, 90]")
                if not (-180 <= loc[1] <= 180):
                    raise serializers.ValidationError("Longitude must be in the range [-180, 180]")
            except (IndexError, ValueError):
                raise serializers.ValidationError("Location must be in the format of <float lat>,<float long>.")
        data['location'] = loc

        checkin = data.get('check_in')
        checkout = data.get('check_out')
        if checkin and checkout and checkin >= checkout:
            raise serializers.ValidationError("Check-in date must be before check-out date")
        return data
