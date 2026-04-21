from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def _tokens_for(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        password1 = request.data.get("password1") or ""
        password2 = request.data.get("password2") or ""

        errors = {}
        if not email:
            errors["email"] = ["This field is required."]
        if not password1:
            errors["password1"] = ["This field is required."]
        if password1 and password1 != password2:
            errors["password2"] = ["Passwords do not match."]
        if User.objects.filter(email__iexact=email).exists():
            errors["email"] = ["An account with this email already exists."]
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(email=email, password=password1)
        return Response(_tokens_for(user), status=status.HTTP_201_CREATED)
