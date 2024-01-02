from rest_framework.pagination import PageNumberPagination


class ListRequestsPagination(PageNumberPagination):
    page_size = 12
