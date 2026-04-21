from django.urls import include, path

urlpatterns = [
    path("api/llm/", include("apps.llm.urls")),
]
