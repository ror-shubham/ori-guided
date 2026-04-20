from django.urls import path

from . import views

urlpatterns = [
    path("follow-up-needed", views.FollowUpNeededView.as_view()),
    path("analyze-stress", views.AnalyzeStressView.as_view()),
    path("route-intervention", views.RouteInterventionView.as_view()),
    path("generate-intro", views.GenerateIntroView.as_view()),
    path("generate-insight", views.GenerateInsightView.as_view()),
]
