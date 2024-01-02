from rest_framework.pagination import PageNumberPagination

class ListCommentPagination(PageNumberPagination):
    page_size = 8
