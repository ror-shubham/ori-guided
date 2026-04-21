from rest_framework import serializers

from apps.llm.serializers import LLM_FLAGS, INTERVENTIONS, WEIGHT_LOCATIONS, CONTEXT_TRIGGERS

from .models import CheckIn


class CheckInSaveSerializer(serializers.Serializer):
    mood = serializers.IntegerField(min_value=1, max_value=5)
    energy = serializers.IntegerField(min_value=1, max_value=5)
    weightLocation = serializers.ChoiceField(choices=WEIGHT_LOCATIONS)
    contextTrigger = serializers.ChoiceField(choices=CONTEXT_TRIGGERS)
    checkinResponse = serializers.CharField()
    followUpQuestion = serializers.CharField(required=False, allow_blank=True, default="")
    followUpResponse = serializers.CharField(required=False, allow_blank=True, default="")
    llmFlag = serializers.ChoiceField(choices=LLM_FLAGS)
    reflection = serializers.CharField()
    interventionType = serializers.ChoiceField(choices=INTERVENTIONS)
    sessionInsight = serializers.CharField(required=False, allow_blank=True, default="")
    prescriptionQuote = serializers.CharField(required=False, allow_blank=True, default="")
    tip = serializers.CharField(required=False, allow_blank=True, default="")

    def create(self, validated_data, user):
        return CheckIn.objects.create(
            user=user,
            mood=validated_data["mood"],
            energy=validated_data["energy"],
            weight_location=validated_data["weightLocation"],
            context_trigger=validated_data["contextTrigger"],
            checkin_response=validated_data["checkinResponse"],
            follow_up_question=validated_data.get("followUpQuestion") or None,
            follow_up_response=validated_data.get("followUpResponse") or None,
            llm_flag=validated_data["llmFlag"],
            reflection=validated_data["reflection"],
            intervention_type=validated_data["interventionType"],
            session_insight=validated_data.get("sessionInsight") or None,
            prescription_quote=validated_data.get("prescriptionQuote") or None,
            tip=validated_data.get("tip") or None,
        )


class CheckInListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = [
            "id",
            "created_at",
            "mood",
            "energy",
            "weight_location",
            "context_trigger",
            "llm_flag",
            "intervention_type",
            "prescription_quote",
            "tip",
            "session_insight",
        ]


class CheckInDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = [
            "id",
            "created_at",
            "mood",
            "energy",
            "weight_location",
            "context_trigger",
            "checkin_response",
            "follow_up_question",
            "follow_up_response",
            "llm_flag",
            "reflection",
            "intervention_type",
            "session_insight",
            "prescription_quote",
            "tip",
        ]
