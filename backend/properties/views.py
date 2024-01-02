from django.db.models import F
from django.db.models.functions import Cos, ASin, Sqrt, Round
from rest_framework.generics import CreateAPIView, RetrieveAPIView, DestroyAPIView, UpdateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import status
from django.contrib.contenttypes.models import ContentType

import notifications.models
from comments.paginations import ListCommentPagination
from comments.serializers import CommentSerializer
from properties.paginations import ListPropertiesPagination
from properties.serializers import *
from properties.models import *


# Create your views here.


class CreatePropertyView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PropertySerializer


class CreatePropertyImageView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyImageSerializer

    def post(self, request, pk):
        # user must be owner
        property = get_object_or_404(Property, id=pk)
        user = request.user

        if property.host != user:
            raise PermissionDenied({"message": "You don't own this property",
                                    "property_id": pk})
        return super().post(request, pk)


class CreateUnavailableView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UnavailableSerializer

    def post(self, request, pk):
        property = get_object_or_404(Property, id=pk)
        user = request.user

        if property.host != user:
            raise PermissionDenied({"message": "You don't own this property",
                                    "property_id": pk})
        return super().post(request, pk)


class CreatePriceAdjustmentView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PriceAdjustmentSerializer

    def post(self, request, pk):
        property = get_object_or_404(Property, id=pk)
        user = request.user

        if property.host != user:
            raise PermissionDenied({"message": "You don't own this property",
                                    "property_id": pk})
        return super().post(request, pk)


class ListPropertiesView(ListAPIView):
    serializer_class = PropertySerializer
    pagination_class = ListPropertiesPagination

    # High(er) performance formula for calculating the haversine distance between two coordinates
    # Adapted from here https://stackoverflow.com/questions/27928/
    def coord_distance(self, lat1, lon1, lat2, lon2):
        p = decimal.Decimal(0.017453292519943295) # pi / 180
        a = decimal.Decimal(0.5) - Cos((lat2 - lat1) * p) / decimal.Decimal(2) + \
            Cos(lat1 * p) * Cos(lat2 * p) * \
            (decimal.Decimal(1) - Cos((lon2 - lon1) * p)) / decimal.Decimal(2)
        return Round(decimal.Decimal(12742) * ASin(Sqrt(a)), decimal.Decimal(5))

    def get_queryset(self):
        queryset = Property.objects.all().order_by('id')
        qp = ListPropertiesSerializer(data=self.request.query_params)
        qp.is_valid(raise_exception=True)

        check_in = qp.validated_data.get("check_in")
        check_out = qp.validated_data.get("check_out")
        num_guests = qp.validated_data.get("num_guests")
        min_price = qp.validated_data.get("min_price")
        max_price = qp.validated_data.get("max_price")
        location = qp.validated_data.get("location")
        sort_by = qp.validated_data.get("sort_by")

        if check_in and check_out and check_in < check_out:
            # returns set of property ids of unavailable time slots
            # that overlap with the desired dates
            # i.e. any ids here must be excluded from the final query
            unavailable_property_ids = Unavailable.objects.all()\
                .filter(start_date__lte=check_out)\
                .filter(end_date__gte=check_in)\
                .values('property_id')
            queryset = queryset.exclude(id__in=unavailable_property_ids)
        if num_guests:
            queryset = queryset.filter(guest_limit__gte=num_guests)
        if min_price:
            # check against base price rather than average price
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
        if location:
            queryset = queryset.annotate(distance=self.coord_distance(
                F('latitude'), F('longitude'), location[0], location[1]))
            if sort_by == "distance":
                queryset = queryset.order_by('distance')
        if sort_by == "rating":
            queryset = queryset.order_by('rating')
        if sort_by == "price_highest":
            queryset = queryset.order_by('-base_price')
        if sort_by == "price_lowest":
            queryset = queryset.order_by('base_price')

        return queryset


class ListPropertyCommentsView(ListAPIView):
    serializer_class = CommentSerializer
    pagination_class = ListCommentPagination

    def get_queryset(self):
        queryset = Comment.objects.filter(comment_to_id=self.kwargs["pk"])
        return queryset.order_by("-publish_date")

class DisplayPropertyView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PropertySerializer

    def get_object(self):
        return get_object_or_404(Property, id=self.kwargs["pk"])


class DeletePropertyView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PropertySerializer

    def delete(self, request, pk):
        property = get_object_or_404(Property, id=pk)
        user = request.user

        if property.host != user:
            raise PermissionDenied({"message": "You don't own this property",
                                    "property_id": pk})

        open_requests = property.propertyrequest_set.all()
        if open_requests.exists():
            for request in open_requests:
                # Since requests will be deleted via cascade, only send out notification
                if request.status == "pending":
                    notifications.models.createRequestUpdate(
                        sender=request.receiver,
                        receiver=request.requester,
                        host=request.user,
                        status="denied"
                    )
                if request.status == "approved":
                    notifications.models.createRequestUpdate(
                        sender=request.receiver,
                        receiver=request.requester,
                        host=request.user,
                        status="terminated"
                    )

        # Deleting property image files off disk
        for image in property.propertyimage_set.all():
            image.delete()
        property.delete()

        # if you have no more properties, you are no longer a host
        if user.property_set.count() == 0:
            user.is_host = False
            user.save()
            
        return Response(status=status.HTTP_204_NO_CONTENT)


class DeleteUnavailableView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UnavailableSerializer

    def delete(self, request, pk, property_id):
        unavailable = get_object_or_404(Unavailable, id=pk)
        user = request.user

        if unavailable.property.id != property_id:
            raise PermissionDenied({"message": "This unavailable slot does not belong to this property",
                                    "property_id": property_id})
        if unavailable.property.host == user:
            if unavailable.is_reservation and unavailable.request:
                if request.status == "approved":
                    notifications.models.createRequestUpdate(
                        sender=unavailable.request.receiver,
                        receiver=unavailable.request.receiver,
                        host=request.user,
                        status="terminated"
                    )
                    unavailable.request.status = 'terminated'
                    unavailable.request.save()
                    unavailable.delete()
                else:
                    # This case should never occur.
                    return Response({"message": "Invalid request status"}, status=400)
            else:
                unavailable.delete()
        else:
            # Users should never delete unavailability directly
            raise PermissionDenied({"message": "You don't own this property",
                                    "property_id": pk})

        return Response(status=status.HTTP_204_NO_CONTENT)


class DeletePriceAdjustmentView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PriceAdjustmentSerializer

    def delete(self, request, pk, property_id):
        adjustment = get_object_or_404(PriceAdjustment, id=pk)
        user = request.user

        if adjustment.property.id != property_id:
            raise PermissionDenied({"message": "This price adjustment does not belong to this property",
                                    "property_id": property_id})
        if adjustment.property.host != user:
            raise PermissionDenied({"message": "You don't own this property",
                                    "property_id": pk})

        adjustment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DeletePropertyImageView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyImageSerializer

    def delete(self, request, pk, property_id):

        image = get_object_or_404(PropertyImage, id=pk)
        user = request.user

        if image.property.id != property_id:
            raise PermissionDenied({"message": "This image does not belong to this property",
                                    "property_id": property_id})
        if image.property.host != user:
            raise PermissionDenied({"message": "You don't own this property",
                                    "property_id": pk})

        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UpdatePropertyView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PropertySerializer

    def patch(self, request, pk):
        property = get_object_or_404(Property, id=pk)
        user = request.user

        if property.host != user:
            raise PermissionDenied({"message": "You don't own this property",
                                    "property_id": pk})

        return super().patch(request, pk)

    def put(self, request, pk):
        property = get_object_or_404(Property, id=pk)
        user = request.user

        if property.host != user:
            raise PermissionDenied({"message": "You don't own this property",
                                    "property_id": pk})

        return super().put(request, pk)

    def get_queryset(self):
        return Property.objects.filter(id=self.kwargs["pk"])
