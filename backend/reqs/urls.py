from django.urls import path 
from reqs.views import *

app_name="requests"
urlpatterns = [
    path("view/", ListRequestsView.as_view(), name="list"),
    path("<int:pk>/view/", DisplayRequestView.as_view(), name="view"),
    path("<int:pk>/cancel/", CreateCancellationRequestView.as_view(), name="cancel"),
    path("toproperty/<int:pk>/update/", UpdatePropertyRequestView.as_view(), name="updatepropertyrequest"),
    path("tocancel/<int:pk>/update/", UpdateCancellationRequestView.as_view(), name="updatecancelrequest")
]