from rest_framework.generics import CreateAPIView, DestroyAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from comments.paginations import *
from comments.serializers import *

# Create your views here.
class CreateCommentView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer

class DeleteCommentView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CommentSerializer

    def delete(self, request, pk):
        comment = get_object_or_404(Comment, id=pk)
        user = request.user

        if comment.commenter != user:
            raise PermissionDenied({"message": "You did not create this comment",
                                    "comment_id": pk})
        comment.delete()
        return Response(status=204)
