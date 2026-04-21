from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CheckIn
from .serializers import CheckInDetailSerializer, CheckInListSerializer, CheckInSaveSerializer


class CheckInSaveView(APIView):
    def post(self, request):
        ser = CheckInSaveSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        checkin = ser.create(ser.validated_data, user=request.user)
        return Response(
            {"id": checkin.id, "created_at": checkin.created_at},
            status=status.HTTP_201_CREATED,
        )


class CheckInListView(ListAPIView):
    serializer_class = CheckInListSerializer

    def get_queryset(self):
        return CheckIn.objects.filter(user=self.request.user)


class CheckInDetailView(APIView):
    def get(self, request, pk):
        try:
            checkin = CheckIn.objects.get(pk=pk, user=request.user)
        except CheckIn.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CheckInDetailSerializer(checkin).data)
