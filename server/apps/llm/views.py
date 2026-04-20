"""API views that replace the browser-direct LLM calls in src/services/llm.ts.

Every view follows the same shape:
  1. Validate request with input serializer.
  2. Build a messages list (system prompt + optional prompt builder + user content).
  3. Call call_llm() with the right json_mode / max_tokens combo.
  4. Parse + validate the LLM response.
  5. Return JSON, or HTTP 502 if the LLM output doesn't match what we asked for.
"""

from __future__ import annotations

import json
import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from . import prompts, serializers
from .client import call_llm

log = logging.getLogger(__name__)


def _bad_gateway(message: str) -> Response:
    return Response({"error": message}, status=status.HTTP_502_BAD_GATEWAY)


def _parse_json(raw: str):
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        log.exception("LLM returned non-JSON payload: %r", raw[:500])
        return None


class FollowUpNeededView(APIView):
    def post(self, request):
        req = serializers.FollowUpNeededRequestSerializer(data=request.data)
        req.is_valid(raise_exception=True)
        data = req.validated_data

        messages = [
            {
                "role": "system",
                "content": prompts.ORI_SYSTEM_PROMPT
                + "\n\n"
                + prompts.build_follow_up_prompt(data["vitals"]),
            },
            {"role": "user", "content": data["userCheckin"]},
        ]
        raw = call_llm(messages, json_mode=True)
        parsed = _parse_json(raw)
        if parsed is None:
            return _bad_gateway("Failed to assess follow-up need.")

        out = serializers.FollowUpNeededResponseSerializer(data=parsed)
        if not out.is_valid():
            log.warning("follow-up validation failed: %s raw=%r", out.errors, raw[:500])
            return _bad_gateway("Follow-up response was malformed.")
        return Response(out.validated_data)


class AnalyzeStressView(APIView):
    def post(self, request):
        req = serializers.AnalyzeStressRequestSerializer(data=request.data)
        req.is_valid(raise_exception=True)
        data = req.validated_data

        messages = [
            {
                "role": "system",
                "content": prompts.ORI_SYSTEM_PROMPT
                + "\n\n"
                + prompts.build_analysis_prompt(data["vitals"]),
            },
            {"role": "user", "content": data["checkinResponse"]},
        ]
        follow_up_q = data.get("followUpQuestion", "")
        follow_up_r = data.get("followUpResponse", "")
        if follow_up_q and follow_up_r:
            messages.append({"role": "assistant", "content": follow_up_q})
            messages.append({"role": "user", "content": follow_up_r})

        raw = call_llm(messages, json_mode=True)
        parsed = _parse_json(raw)
        if parsed is None:
            return _bad_gateway("Failed to parse stress analysis.")

        if parsed.get("llmFlag") not in serializers.LLM_FLAGS:
            parsed["llmFlag"] = "neutral"

        out = serializers.StressAnalysisSerializer(data=parsed)
        if not out.is_valid():
            log.warning("analysis validation failed: %s raw=%r", out.errors, raw[:500])
            return _bad_gateway("Stress analysis response was malformed.")
        return Response(out.validated_data)


class RouteInterventionView(APIView):
    def post(self, request):
        req = serializers.RouteInterventionRequestSerializer(data=request.data)
        req.is_valid(raise_exception=True)
        data = req.validated_data

        messages = [
            {"role": "system", "content": prompts.ORI_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": prompts.build_routing_prompt(
                    data["analysis"], data["vitals"]
                ),
            },
        ]
        raw = call_llm(messages, json_mode=True)
        parsed = _parse_json(raw)
        if parsed is None:
            return _bad_gateway("Failed to determine best intervention.")

        out = serializers.RoutingResultSerializer(data=parsed)
        if not out.is_valid():
            log.warning("routing validation failed: %s raw=%r", out.errors, raw[:500])
            return _bad_gateway("Routing response was malformed.")
        return Response(out.validated_data)


class GenerateIntroView(APIView):
    def post(self, request):
        req = serializers.GenerateIntroRequestSerializer(data=request.data)
        req.is_valid(raise_exception=True)
        data = req.validated_data

        messages = [
            {"role": "system", "content": prompts.ORI_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": prompts.build_intervention_intro_prompt(
                    data["analysis"],
                    data["intervention"],
                    data.get("followUpResponse") or None,
                ),
            },
        ]
        try:
            raw = call_llm(messages, json_mode=True)
            parsed = _parse_json(raw)
            if parsed is None:
                return Response(None)
            out = serializers.InterventionContentSerializer(data=parsed)
            if not out.is_valid():
                log.warning(
                    "intro validation failed: %s raw=%r", out.errors, raw[:500]
                )
                return Response(None)
            return Response(out.validated_data)
        except Exception:
            log.exception("generate-intro failed")
            return Response(None)


class GenerateInsightView(APIView):
    def post(self, request):
        req = serializers.GenerateInsightRequestSerializer(data=request.data)
        req.is_valid(raise_exception=True)
        data = req.validated_data

        messages = [
            {"role": "system", "content": prompts.ORI_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": prompts.build_session_insight_prompt(
                    data["analysis"],
                    data["intervention"],
                    data["userResponse"],
                    data.get("followUpResponse") or None,
                ),
            },
        ]
        try:
            raw = call_llm(messages, json_mode=False, max_tokens=500)
            return Response({"insight": (raw or "").strip()})
        except Exception:
            log.exception("generate-insight failed")
            return Response({"insight": ""})
