from django.urls import path 
from notifications.views import *

app_name="notifications"
urlpatterns = [
    path("view/", ListUserNotificationsView.as_view(), name="list"),
    path("markallread/", MarkNotificationsAsReadView.as_view(), name="markallread"),
    path("<int:pk>/view/", DisplayNotificationView.as_view(), name="view"),
    path("<int:pk>/delete/", DeleteNotificationView.as_view(), name="delete")
]