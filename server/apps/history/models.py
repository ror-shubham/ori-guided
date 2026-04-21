from django.conf import settings
from django.db import models


class CheckIn(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="checkins",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # Vitals
    mood = models.IntegerField()
    energy = models.IntegerField()
    weight_location = models.CharField(max_length=10)
    context_trigger = models.CharField(max_length=10)

    # User text
    checkin_response = models.TextField()
    follow_up_question = models.TextField(null=True, blank=True)
    follow_up_response = models.TextField(null=True, blank=True)

    # Analysis
    llm_flag = models.CharField(max_length=20)
    reflection = models.TextField()

    # Intervention
    intervention_type = models.CharField(max_length=20)

    # Card output
    session_insight = models.TextField(null=True, blank=True)
    prescription_quote = models.TextField(null=True, blank=True)
    tip = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
