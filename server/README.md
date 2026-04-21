# ori-guided server (v2.1)

Django + DRF backend that moves the five LLM calls off the browser. See the
root [README.md](../README.md) for product context.

## Endpoints

All under `/api/llm/` (POST, JSON).

| Route | Replaces (src/services/llm.ts) |
|---|---|
| `follow-up-needed` | `assessFollowUp` |
| `analyze-stress` | `getStressAnalysis` |
| `route-intervention` | `routeInterventionWithLLM` |
| `generate-intro` | `generateInterventionIntro` |
| `generate-insight` | `generateSessionInsight` |

Provider is pinned server-side via `LLM_PROVIDER` (`openai` or `gemini`). Access
is gated by a CORS allow-list only — no auth, no rate limiting in 2.1. Keep
this on localhost / a closed host until 2.2 ships auth.

## Local setup

```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -e .

cp .env.example .env
# edit .env: set LLM_PROVIDER + the matching *_API_KEY

python manage.py migrate
python manage.py runserver 8000
```

The API is now on `http://localhost:8000/api/llm/*`. Point the frontend at it
with `VITE_API_BASE_URL=http://localhost:8000` in the repo-root `.env`.
