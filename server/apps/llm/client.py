"""OpenAI SDK client shared by all views.

Uses the OpenAI Python SDK for both providers:
- openai: default base_url, model gpt-4o-mini
- gemini: OpenAI-compatible endpoint at
  https://generativelanguage.googleapis.com/v1beta/openai/, model gemini-2.5-flash

This mirrors src/services/llm.ts which hits Google's OpenAI-compatible URL
when VITE_USE_GEMINI is on."""

from __future__ import annotations

from django.conf import settings
from openai import OpenAI

_GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

if settings.LLM_PROVIDER == "openai":
    _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    _model = "gpt-4o-mini"
else:
    _client = OpenAI(api_key=settings.GEMINI_API_KEY, base_url=_GEMINI_BASE_URL)
    _model = "gemini-2.5-flash"


def call_llm(
    messages: list[dict],
    *,
    json_mode: bool,
    max_tokens: int = 1500,
) -> str:
    kwargs: dict = {
        "model": _model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": max_tokens,
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}
    response = _client.chat.completions.create(**kwargs)
    return response.choices[0].message.content or ""
