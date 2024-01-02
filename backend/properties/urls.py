from django.urls import path
from properties.views import *
from reqs.views import *

app_name="properties"
urlpatterns = [
    path("create/", CreatePropertyView.as_view(), name="create"),
    path("all/", ListPropertiesView.as_view(), name="allproperties"),
    path("<int:pk>/unavailable/add/", CreateUnavailableView.as_view(), name="addunavailable"),
    path("<int:pk>/price_adjustment/add/", CreatePriceAdjustmentView.as_view(), name="addadjustment"),
    path("<int:property_id>/unavailable/delete/<int:pk>/", DeleteUnavailableView.as_view(), name="deleteunavailable"),
    path("<int:property_id>/price_adjustment/delete/<int:pk>/", DeletePriceAdjustmentView.as_view(), name="deleteadjustment"),
    path("<int:pk>/images/add/", CreatePropertyImageView.as_view(), name="addimage"),
    path("<int:property_id>/images/delete/<int:pk>/", DeletePropertyImageView.as_view(), name="deleteimage"),
    path("<int:pk>/view/", DisplayPropertyView.as_view(), name="view"),
    path("<int:pk>/comments/", ListPropertyCommentsView.as_view(), name="comments"),
    path("<int:pk>/delete/", DeletePropertyView.as_view(), name="delete"),
    path("<int:pk>/update/", UpdatePropertyView.as_view(), name="update"),
    path("<int:pk>/request/", CreatePropertyRequestView.as_view(), name="request")
]