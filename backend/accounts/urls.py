from django.urls import path 
from accounts.views import *
# from the slides... (post to api/token with username+password)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

app_name = "accounts"
urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("<int:pk>/view/", DisplayProfileView.as_view(), name="view"),
    path("<int:pk>/comments/", ListUserCommentsView.as_view(), name="comments"),
    path("<int:pk>/reviewedby/<int:pk2>/", CheckUserReviewedByAnotherView.as_view(), name="checkreviewed"),
    path("<int:pk>/propertycomments/", ListUserPropertyCommentsView.as_view(), name="propertycomments"),
    path("<int:pk>/properties/view/", ListUserPropertiesView.as_view(), name="viewproperties"),
    path("update/", UpdateUserView.as_view(), name="update"),
    path("view/", DisplayYourProfileView.as_view(), name='your_profile'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]