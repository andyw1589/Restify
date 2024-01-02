from rest_framework.pagination import PageNumberPagination


class ListUserPropertiesPagination(PageNumberPagination):
    page_size = 6

class ListUserNotificationsPagination(PageNumberPagination):
    page_size = 15
