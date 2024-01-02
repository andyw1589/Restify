from rest_framework import serializers

from accounts.models import User

# followed a tutorial from
# https://www.codersarts.com/post/how-to-create-register-and-login-api-using-django-rest-framework-and-token-authentication
# and https://www.django-rest-framework.org/api-guide/serializers/#modelserializer


class UserSerializer(serializers.ModelSerializer):
    year_joined = serializers.SerializerMethodField()

    def get_year_joined(self, obj):
        return obj.date_joined.year

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name",
            "last_name", "year_joined", "phone_number", "is_host", "avatar", "rating", "num_ratings"]
        extra_kwargs = {
            "rating": {"read_only": True},
            "num_ratings": {"read_only": True},
        }
class BasicUserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name"]

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "password2", "first_name", "last_name", "phone_number", "avatar"]
        # define required fields
        extra_kwargs = {
            "id": {"read_only": True},
            "email": {"required": True},
            "first_name": {"required": True},
            "last_name": {"required": True}
        }

    def validate(self, data):
        # unique username is already done by default
        # match passwords
        if data["password"] != data["password2"]:
            raise serializers.ValidationError(
                {"password": "Passwords must match"}
            )
        
        return data

    # used by CreateAPIView
    def create(self, data):
        user = User.objects.create(
            username=data["username"],
            email=data["email"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone_number=data["phone_number"]
        )
        user.set_password(data["password"])

        if data.get("avatar"):
            user.avatar = data["avatar"]

        user.save()
        return user  # return what was created
