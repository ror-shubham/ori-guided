from django.urls import path

from . import views

urlpatterns = [
    path("save", views.CheckInSaveView.as_view()),
    path("", views.CheckInListView.as_view()),
    path("<int:pk>", views.CheckInDetailView.as_view()),
]
