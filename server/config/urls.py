from django.urls import include, path

urlpatterns = [
    path("api/llm/", include("apps.llm.urls")),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/", include("apps.accounts.urls")),
]
