from rest_framework import status
from rest_framework.generics import CreateAPIView, RetrieveAPIView, UpdateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from reqs.paginations import ListRequestsPagination
from reqs.serializers import *
from reqs.models import *
from properties.models import Unavailable

import notifications
import datetime


# Create your views here.
class CreatePropertyRequestView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyRequestSerializer

    def post(self, request, pk):
        property = get_object_or_404(Property, id=pk)
        # host must not be the user
        user = request.user
        if user == property.host:
            raise PermissionDenied({"message": "Cannot request your own property.",
                                    "property_id": pk})

        # If start date and end date are not provided, will be caught in serializer
        # after calling super so no need for further action here
        if request.data.get('start_date') and request.data.get('end_date'):
            reservations = property.unavailable_set.all()
            overlap = reservations.filter(start_date__lte=request.data['end_date'])\
                .filter(end_date__gte=request.data['start_date']).exists()
            if overlap:
                return Response({"message": "This request overlaps with an unavailable time slot."}, status=400)

            pending_requests = user.sent_property_requests.all().filter(status='pending')
            overlap = pending_requests.filter(start_date__lte=request.data['end_date'])\
                .filter(end_date__gte=request.data['start_date']).exists()
            if overlap:
                return Response({"message": "This request overlaps with one of your previous requests."}, status=400)

        return super().post(request, pk)


class CreateCancellationRequestView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CancellationRequestSerializer

    def post(self, request, pk):
        req = get_object_or_404(PropertyRequest, id=pk)

        # user must be the requester
        user = request.user
        if user != req.requester:
            raise PermissionDenied({"message": "Cannot cancel a request you didn't make.",
                                    "request_id": pk})

        return super().post(request, pk)

# Takes a query parameter "received", for if you want to see sent requests or received requests
# defaults to sent requests
# also takes in type; see below


class ListRequestsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PropertyRequestSerializer
    pagination_class = ListRequestsPagination

    def get_queryset(self):
        get = self.request.GET
        mode = get.get("mode")
        type = self.request.GET.get("type")

        if type == "cancellation":
            self.serializer_class = CancellationRequestSerializer
            if mode == "incoming":
                return self.request.user.received_cancellation_requests.all().order_by("-created")
            elif mode == "outgoing":
                return self.request.user.sent_cancellation_requests.all().order_by("-created").exclude(status__in={"completed", "terminated"})
            elif mode == "finished":
                return self.request.user.sent_cancellation_requests.all().order_by("-created").filter(status__in={"completed", "terminated"})
        else:
            if mode == "incoming":
                reqs = self.request.user.received_property_requests.all().order_by("-created")
            elif mode == "outgoing":
                reqs = self.request.user.sent_property_requests.all().order_by("-created").exclude(status__in={"completed", "terminated"})
            elif mode == "finished":
                reqs = self.request.user.sent_property_requests.all().order_by("-created").filter(status__in={"completed", "terminated"})

            # Mark relevant requests as expired
            pending = reqs.filter(status='pending')
            expired = pending.filter(expiry_date__lt=datetime.datetime.now().date()) | \
                      pending.filter(start_date__lt=datetime.datetime.now().date())
            for request in expired:
                request.status = "expired"
                request.save()

            # Mark relevant requests as completed
            completed = reqs.filter(status='approved').filter(end_date__lt=datetime.datetime.now().date())
            for request in completed:
                request.status = "completed"
                request.save()

            return reqs

# query parameter is "type"; whether it's a property or cancellation request/defaults to property


class DisplayRequestView(RetrieveAPIView):
    serializer_class = PropertyRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # see if pk is a PropertyRequest or a Cancellation request
        request = None
        type = self.request.GET.get("type")

        if type == "cancellation":
            self.serializer_class = CancellationRequestSerializer
            request = get_object_or_404(
                CancellationRequest, id=self.kwargs["pk"])
        else:
            request = get_object_or_404(PropertyRequest, id=self.kwargs["pk"])

            # if the date is past the expiration date and if it's still pending
            # also expires if its still pending after the start date
            if request.status == "pending" and (datetime.datetime.now().date() > request.expiry_date
                or datetime.datetime.now().date() > request.start_date):
                request.status = "expired"
                request.save()
            # Also change approved requests to completed after their stay
            if request.status == "approved" and datetime.datetime.now().date() > request.end_date:
                request.status = "completed"
                request.save()

        # you must be either the receiver or requester
        if not (self.request.user == request.requester or self.request.user == request.receiver):
            raise PermissionDenied({"message": "You can't view this request.",
                                    "request_id": self.kwargs["pk"]})

        return request

# receiver can update request status


class UpdatePropertyRequestView(UpdateAPIView):
    permission_classes = [IsAuthenticated]

    def handle_host_request(self, propertyrequest, httprequest, new_status):
        if new_status == "denied":
            if propertyrequest.status != "pending":
                return Response({"message": "Can only deny pending requests."}, status=400)
        elif new_status == "approved":
            if propertyrequest.status != "pending":
                return Response({"message": "Can only approve pending requests."}, status=400)
            Unavailable.objects.create(
                start_date=propertyrequest.start_date,
                end_date=propertyrequest.end_date,
                property=propertyrequest.property,
                is_reservation=True,
                request=propertyrequest
            )
        elif new_status == "terminated":
            # terminate an approved request
            if propertyrequest.status != "approved":
                return Response({"message": "Can only terminate approved requests."}, status=400)

            # remove the unavailable time slot
            propertyrequest.unavailable.delete()
        else:
            return Response({"message": "Not a valid status."}, status=400)

        propertyrequest.status = new_status
        propertyrequest.save()
        notifications.models.createRequestUpdate(
            sender=httprequest.user,
            receiver=propertyrequest.requester,
            request=propertyrequest
        )

        s = PropertyRequestSerializer(propertyrequest)
        return Response({"data": s.data}, status=200)

    def handle_user_request(self, propertyrequest, httprequest, new_status):
        if new_status == "cancelled":
            if propertyrequest.status != "pending":
                return Response({"message": "Users can only cancel pending requests."}, status=400)
            notifications.models.createRequestUpdate(
                sender=propertyrequest.requester,
                receiver=propertyrequest.receiver,
                property=propertyrequest.property,
                request=propertyrequest,
                host=httprequest.user,
                status=new_status
            )
            propertyrequest.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"message": "Not a valid status."}, status=400)


    def patch(self, request, pk):
        req = get_object_or_404(PropertyRequest, id=pk)
        user = request.user

        if user != req.receiver and user != req.requester:
            raise PermissionDenied({"message": "You can't update this request.",
                                    "request_id": pk})

        new_status = request.data.get("new_status")
        if new_status is None:
            return Response({"message": "You must pass in a new_status"}, status=400)
        elif new_status == req.status:
            return Response({"message": "New status cannot be the same as the old one."}, status=400)

        if user == req.receiver:
            return self.handle_host_request(req, request, new_status)
        else:
            return self.handle_user_request(req, request, new_status)

    def put(self, request, pk):
        # disallow put requests because im lazy
        return Response(status=405)


class UpdateCancellationRequestView(UpdateAPIView):
    serializer_class = CancellationRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_auth_request(self, request, pk):
        req = get_object_or_404(CancellationRequest, id=pk)
        user = request.user

        if user != req.receiver:
            raise PermissionDenied({"message": "You can't update this request.",
                                    "request_id": pk})

        return req

    def patch(self, request, pk):
        req = self.get_auth_request(request, pk)
        new_status = request.data.get("new_status")

        if new_status is None:
            return Response({"message": "You must pass in a new_status"}, status=400)
        elif new_status == req.status:
            return Response({"message": "New status cannot be the same as the old one."}, status=400)
        elif new_status == "denied":
            if req.status != "pending":
                return Response({"message": "Can only deny pending requests."}, status=400)
            # cancellation was denied; set the original request back to approved
            req.request.status = "approved"
            req.request.save()
        elif new_status == "approved":
            if req.status != "pending":
                return Response({"message": "Can only approve pending requests."}, status=400)
            # cancel the request
            req.request.status = "cancelled"
            req.request.save()

            # since it's cancelled, remove the unavailability
            req.request.unavailable.delete()
        else:
            return Response({"message": "Not a valid status."}, status=400)

        req.status = new_status
        req.save()

        notifications.models.createCancellationRequestUpdate(
            sender=req.receiver,
            receiver=req.requester,
            request=req
        )
        
        s = CancellationRequestSerializer(req)
        return Response({"data": s.data}, status=200)

    def put(self, request, pk):
        # disallow put requests because im lazy
        return Response(status=405)
