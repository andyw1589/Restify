from rest_framework.generics import CreateAPIView, RetrieveAPIView, ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.shortcuts import get_object_or_404
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType

from accounts.serializers import *
from accounts.models import User
from accounts.paginations import *
from comments.paginations import ListCommentPagination
from comments.serializers import CommentSerializer
from comments.models import Comment
from properties.serializers import PropertySerializer
from properties.models import Property


# Create your views here.
class RegisterView(CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class DisplayYourProfileView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class DisplayProfileView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(User, id=self.kwargs["pk"])

class ListUserCommentsView(ListAPIView):
    serializer_class = CommentSerializer
    pagination_class = ListCommentPagination

    def get_queryset(self):
        queryset = User.objects.get(id=self.kwargs["pk"]).comments.all().order_by("-publish_date")
        return queryset

class ListUserPropertyCommentsView(ListAPIView):
    serializer_class = CommentSerializer
    pagination_class = ListCommentPagination

    def get_queryset(self):
        queryset = Comment.objects.filter(content_type=ContentType.objects.get_for_model(Property), commenter=self.kwargs["pk"]).order_by("-publish_date")
        return queryset

# check if the user denoted by pk has been reviewed by the user denoted by pk2
class CheckUserReviewedByAnotherView(APIView):
    http_method_names = ["get"]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, pk2):
        queryset = Comment.objects.filter(content_type=ContentType.objects.get_for_model(User), commenter=pk2, comment_to_id=pk)
        return Response({"result": queryset.exists()}, status=200)

class ListUserPropertiesView(ListAPIView):
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ListUserPropertiesPagination

    def get_queryset(self):
        user = get_object_or_404(User, id=self.kwargs["pk"])
        return user.property_set.all().order_by('id')
    
class UpdateUserView(APIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ["patch"]
    parser_classes = [MultiPartParser]

    def patch(self, request):
        user = request.user
        data = request.data

        # validate email
        if data.get("email"):
            # from https://stackoverflow.com/questions/3217682/checking-validity-of-email-in-django-python
            try:
                validate_email(data["email"])
                user.email = data["email"]
            except ValidationError:
                return Response({"message": "Please enter a valid email."}, status=400)
        
        # validate new password
        if data.get("password"):
            if not data.get("password2"):
                return Response({"message": "Please confirm your password."}, status=400)
            elif data["password2"] != data["password"]:
                return Response({"message": "Passwords do not match."}, status=400)
            user.set_password(data["password"])

        # names
        if data.get("first_name"):
            user.first_name = data["first_name"]
        if data.get("last_name"):
            user.last_name = data["last_name"]

        # phone number
        if data.get("phone_number"):
            if not data["phone_number"].isnumeric() or len(data["phone_number"]) > 10:
                return Response({"message": "Please enter a valid phone number."}, status=400)
            user.phone_number = data["phone_number"]

        if data.get("avatar"):
            user.avatar = data["avatar"]

        user.save()
        s = UserSerializer(user)
        return Response({"data": s.data}, status=200)
    