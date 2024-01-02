from rest_framework.pagination import PageNumberPagination


class ListPropertiesPagination(PageNumberPagination):
    page_size = 10
