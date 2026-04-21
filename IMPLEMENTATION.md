# ori-guided Implementation Progress

**Last updated:** April 20, 2026

---

## Current Phase: v2.1 — Server-held LLM keys (COMPLETE)

The app has transitioned from a pure frontend SPA to a frontend + Django backend architecture. All five LLM calls now proxy through the backend; provider API keys never reach the browser.

### ✅ Completed in v2.1

#### Backend (server/)
- **Django 5 + DRF setup** ([config/](server/config/), [apps/llm/](server/apps/llm/))
- **Five LLM endpoints** replacing browser-direct calls:
  - `POST /api/llm/follow-up-needed` ← `assessFollowUp()`
  - `POST /api/llm/analyze-stress` ← `getStressAnalysis()`
  - `POST /api/llm/route-intervention` ← `routeInterventionWithLLM()`
  - `POST /api/llm/generate-intro` ← `generateInterventionIntro()`
  - `POST /api/llm/generate-insight` ← `generateSessionInsight()`
- **Server-side prompt templates** ([prompts.py](server/apps/llm/prompts.py)) — byte-identical port from TypeScript
- **OpenAI SDK client** ([client.py](server/apps/llm/client.py)) handles both providers via `base_url` swap
- **DRF serializers** with enum validation (vitals, stress flags, interventions)
- **CORS allow-list** via [django-cors-headers](server/config/settings.py)
- **Boot-time validation** — missing provider key raises `ImproperlyConfigured` at startup

#### Frontend
- **Thin HTTP client** ([src/services/llm.ts](src/services/llm.ts)) — 5 endpoints, same function signatures
- **Deleted** APIKeySetup.tsx, APIKeySetup.css, src/services/prompts.ts
- **Removed setup flow** — app starts at 'welcome' step
- **Type cleanup** ([src/types/index.ts](src/types/index.ts)) — dropped `'setup'` from Step, dropped `LLMProvider`
- **App simplification** ([src/App.tsx](src/App.tsx)) — no reset-key button, no localStorage manipulation

#### Documentation
- **[server/README.md](server/README.md)** — backend boot + dev setup
- **[.env.example](.env.example)** — `VITE_API_BASE_URL=http://localhost:8000`
- **[README.md](README.md)** — updated Stack, Setup, First-time Config, Decision Rationale

#### Verification
- ✅ Frontend: `npm run lint`, `npm run build` pass clean (typecheck + bundle)
- ✅ Backend: `python manage.py check`, `migrate` clean; Django system check passes
- ✅ E2E: Live `POST /api/llm/follow-up-needed` → valid JSON from Gemini (tested)
- ✅ Validation: `mood=9` → 400 DRF error, no LLM call; `intervention="nap"` → 400
- ✅ CORS: Preflight from `localhost:5173` succeeds; `evil.com` gets no allow-origin header
- ✅ Boot: Missing `GEMINI_API_KEY` raises `ImproperlyConfigured` at startup

---

## v2.1 Intentional Exclusions (defer to v2.2+)

- ❌ **Rate limiting** (per-IP, per-user) — explicitly out of scope
- ❌ **Per-user monthly token budget** — out of scope
- ❌ **User authentication** (magic link, OAuth) — that's v2.2
- ❌ **Postgres history DB** — that's v2.3
- ❌ **Streaming** (unused `streamLLM` from v1) — not needed yet

### ⚠️ Security Posture for v2.1

**Known gap:** CORS alone is not sufficient to protect credentials. The API is open to any origin that knows the URL (curl / Postman bypass browser CORS). This is acceptable **only if the API stays on `localhost` or a closed staging host** until v2.2 ships authentication + rate limits.

Do not deploy this publicly as-is.

---

## How to Run v2.1

### Backend
```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -e .

cp .env.example .env
# Edit .env: set LLM_PROVIDER (openai or gemini) + matching API key
# Example: LLM_PROVIDER=gemini, GEMINI_API_KEY=AIza...

python manage.py migrate
python manage.py runserver 8000
```

### Frontend
```bash
cd ..
npm install

cp .env.example .env
# Already points to http://localhost:8000

npm run dev
```

Opens at `http://localhost:5173`. Step flow is unchanged: welcome → vitals → check-in → (optional follow-up) → reflection → intervention → card.

---

## Critical Files for Future Changes

### Backend
- **Add new LLM endpoint:** [server/apps/llm/views.py](server/apps/llm/views.py) (add APIView), [urls.py](server/apps/llm/urls.py) (add path), [serializers.py](server/apps/llm/serializers.py) (add input/output schemas)
- **Change prompt text:** [server/apps/llm/prompts.py](server/apps/llm/prompts.py) — keep byte-identical to frontend source if syncing back
- **Adjust CORS:** [server/config/settings.py](server/config/settings.py) line ~40
- **Add env vars:** [server/.env.example](server/.env.example), [server/config/settings.py](server/config/settings.py) (parsing logic)
- **Add rate limits:** Create middleware in [server/config/middleware.py](server/config/middleware.py) + INSTALLED_APPS hook
- **Add auth:** v2.2 will add session/token in [server/apps/auth/](server/apps/auth/) or use Supabase / Clerk

### Frontend
- **Add new endpoint call:** [src/services/llm.ts](src/services/llm.ts) (add `export async function`)
- **Use new LLM call:** [src/App.tsx](src/App.tsx) (add to a step handler)
- **Update types:** [src/types/index.ts](src/types/index.ts) if new Step / InterventionType / LLMFlag

### Shared
- **Provider selection:** Hardcoded server-side via `LLM_PROVIDER` env var. If future needs per-user provider choice, add a user table + auth (v2.2) and read provider from there instead of env.
- **Prompt tuning:** Edit [server/apps/llm/prompts.py](server/apps/llm/prompts.py) — no frontend rebuild needed. Changes ship on next API restart.

---

## Enum Reference (source of truth)

These must stay in sync between frontend types and backend serializers:

| Enum | Values | Frontend Type | Backend Location |
|---|---|---|---|
| `InterventionType` | breathing, grounding, reframe, journaling, movement, rehearsal | [src/types/index.ts:13-19](src/types/index.ts#L13-L19) | [server/apps/llm/serializers.py:7](server/apps/llm/serializers.py#L7) |
| `LLMFlag` | overwhelm, rumination, fatigue, tension, neutral | [src/types/index.ts:21](src/types/index.ts#L21) | [server/apps/llm/serializers.py:6](server/apps/llm/serializers.py#L6) |
| `Step` | welcome, vitals, checkin, followup, reflection, intervention, card | [src/types/index.ts:1-8](src/types/index.ts#L1-L8) | N/A (backend-agnostic) |
| `MoodLevel` / `EnergyLevel` | 1–5 | [src/types/index.ts:28-29](src/types/index.ts#L28-L29) | [server/apps/llm/serializers.py:20-21](server/apps/llm/serializers.py#L20-L21) |
| `WeightLocation` | head, body, both | [src/types/index.ts:30](src/types/index.ts#L30) | [server/apps/llm/serializers.py:8](server/apps/llm/serializers.py#L8) |
| `ContextTrigger` | before, during, after, general | [src/types/index.ts:31](src/types/index.ts#L31) | [server/apps/llm/serializers.py:9](server/apps/llm/serializers.py#L9) |

---

## Next Steps (v2.2+)

See [/home/shubh/.claude/plans/create-a-detailed-summary-generic-kahan.md](/home/shubh/.claude/plans/create-a-detailed-summary-generic-kahan.md) for the full roadmap. Recommended sequence:

1. **v2.2 — Auth** (magic link + Google OAuth, session cookies, delete-account flow)
2. **v2.2 — Rate limits** (per-IP + per-user monthly budget)
3. **v2.3 — History DB** (Postgres schema, `/history` UI, encryption for free-text)
4. **v2.5 — Telemetry** (PostHog / structured logs, crisis audit)
5. *(ship v2, validate retention)*
6. **v3.1 — Personalization** (user context from past sessions, bias routing)
7. **v3.2 — In-session chat** (streaming, follow-up Q&A inside interventions)
8. **v3.4 — Calendar integration** (pre-event rehearsals, post-meeting resets)
9. **v3.3 — Wearables** (HRV/HR ingestion, proactive check-ins, mobile app)
10. **v3.5/v3.6 — Nudges + coach sharing**

---

## Troubleshooting

### "VITE_API_BASE_URL is not set" error on npm run dev
**Fix:** Copy `.env.example` to `.env` in the repo root and ensure it contains `VITE_API_BASE_URL=http://localhost:8000`.

### "GEMINI_API_KEY is required but was not set" at server boot
**Fix:** Check `server/.env`. Set `LLM_PROVIDER=gemini` and ensure `GEMINI_API_KEY=` is not blank. (If using OpenAI, set `LLM_PROVIDER=openai` and `OPENAI_API_KEY=` instead.)

### Frontend can't reach backend (network error in DevTools)
**Check:**
1. Is the Django server running? (`python manage.py runserver 8000`)
2. Is `VITE_API_BASE_URL` correct in `.env`?
3. Is the origin in your browser (`http://localhost:5173`) listed in `server/.env` under `CORS_ALLOWED_ORIGINS`?

### LLM call returns HTTP 502
**Check:** Backend logs (`python manage.py runserver` stdout). Common causes:
- Provider API key is expired or wrong.
- Provider is down or rate-limiting (wait and retry).
- LLM response doesn't match expected schema (check DRF validation errors in Django logs).

---

## Code Style Notes

- **Backend:** Type hints on all functions. Snake_case for Python. JSON keys in API responses stay camelCase (TS client expectation).
- **Frontend:** TypeScript strict mode. Avoid `any`. DRF validation errors returned as-is; frontend displays them via error boundary.
- **Prompts:** Keep prompt text byte-identical between server and any future frontend sync (version control for determinism).
- **No premature abstraction:** Three similar LLM views is OK; add a helper when a fourth appears.
