from django.urls import path 
from comments.views import *

app_name = "comments"
urlpatterns = [
    path("create/", CreateCommentView.as_view(), name="create"),
    path("<int:pk>/delete/", DeleteCommentView.as_view(), name="delete"),
]
