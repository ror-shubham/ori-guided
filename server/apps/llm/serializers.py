"""Request and response schemas for /api/llm/* endpoints.

Enum members are the source-of-truth mirror of src/types/index.ts. Keep them
in sync when adding a new intervention or llmFlag value."""

from rest_framework import serializers

LLM_FLAGS = ("overwhelm", "rumination", "fatigue", "tension", "neutral")
INTERVENTIONS = (
    "breathing",
    "grounding",
    "reframe",
    "journaling",
    "movement",
    "rehearsal",
)
WEIGHT_LOCATIONS = ("head", "body", "both")
CONTEXT_TRIGGERS = ("before", "during", "after", "general")


class VitalsSerializer(serializers.Serializer):
    mood = serializers.IntegerField(min_value=1, max_value=5)
    energy = serializers.IntegerField(min_value=1, max_value=5)
    weightLocation = serializers.ChoiceField(choices=WEIGHT_LOCATIONS)
    contextTrigger = serializers.ChoiceField(choices=CONTEXT_TRIGGERS)


class StressAnalysisSerializer(serializers.Serializer):
    reflection = serializers.CharField()
    transitionLine = serializers.CharField()
    llmFlag = serializers.ChoiceField(choices=LLM_FLAGS)
    interventionReason = serializers.CharField()
    reframePrompt = serializers.CharField()
    prescriptionQuote = serializers.CharField()
    tip = serializers.CharField()


class FollowUpNeededRequestSerializer(serializers.Serializer):
    userCheckin = serializers.CharField()
    vitals = VitalsSerializer()


class FollowUpNeededResponseSerializer(serializers.Serializer):
    needed = serializers.BooleanField()
    question = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs.get("needed") and not attrs.get("question", "").strip():
            raise serializers.ValidationError(
                "question is required when needed is true"
            )
        return attrs


class AnalyzeStressRequestSerializer(serializers.Serializer):
    checkinResponse = serializers.CharField()
    vitals = VitalsSerializer()
    followUpQuestion = serializers.CharField(required=False, allow_blank=True)
    followUpResponse = serializers.CharField(required=False, allow_blank=True)


class RouteInterventionRequestSerializer(serializers.Serializer):
    analysis = StressAnalysisSerializer()
    vitals = VitalsSerializer()


class RoutingResultSerializer(serializers.Serializer):
    primary = serializers.ChoiceField(choices=INTERVENTIONS)
    alternative = serializers.ChoiceField(choices=INTERVENTIONS)
    reasoning = serializers.CharField(required=False, allow_blank=True)


class GenerateIntroRequestSerializer(serializers.Serializer):
    analysis = StressAnalysisSerializer()
    intervention = serializers.ChoiceField(choices=INTERVENTIONS)
    followUpResponse = serializers.CharField(required=False, allow_blank=True)


class InterventionContentSerializer(serializers.Serializer):
    introText = serializers.CharField()
    completionText = serializers.CharField()


class GenerateInsightRequestSerializer(serializers.Serializer):
    analysis = StressAnalysisSerializer()
    intervention = serializers.ChoiceField(choices=INTERVENTIONS)
    userResponse = serializers.CharField(allow_blank=True)
    followUpResponse = serializers.CharField(required=False, allow_blank=True)
