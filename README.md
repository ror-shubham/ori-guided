# ori-guided

An AI-guided 5-minute stress check-in that routes you to a personalized micro-intervention, narrated by **Ori** — WONE's (Walking on Earth) wellbeing coach persona.

Deployed at: https://ori.w3shubh.com/

---

## What it is

`ori-guided` is a single-page React app that walks a user through a short, structured reset:

1. Capture vitals (mood, energy, where stress is felt, context trigger).
2. Free-text check-in — "What's on your mind?"
3. Optional LLM-generated follow-up question for context.
4. Stress-pattern analysis + routing to one of six interventions.
5. The chosen intervention (1–5 minutes).
6. A shareable "Resilience Prescription Card" with a quote, insight, and carry-forward tip.

The six interventions:

| Intervention | Best for |
|---|---|
| **Breathing** | anxiety, panic, needing calm |
| **Grounding** | dissociation, spiraling, disconnection |
| **Cognitive Reframe** | rumination, catastrophizing |
| **Journaling** | processing, making sense, releasing |
| **Movement Reset** | physical tension, high energy |
| **Mental Rehearsal** | anticipatory anxiety, confidence |

### Stack

**Frontend:** React 19 · TypeScript 6 · Vite 8. **Backend (v2.1):** Django 5 · DRF. The frontend calls `/api/llm/*` on the backend; the backend holds the provider key and makes the outbound call to **OpenAI** (`gpt-4o-mini`) or **Google Gemini** (`gemini-2.5-flash`) based on its own `LLM_PROVIDER` env var.

### Architecture

Step-based finite state machine driven by a single `step` variable in [src/App.tsx](src/App.tsx):

```
setup → welcome → vitals → checkin ─┬─> followup ─> reflection ─> intervention ─> card
                                    └────────────> reflection ─> intervention ─> card
```

- UI components live in [src/components/](src/components/).
- LLM client + prompt templates live in [src/services/llm.ts](src/services/llm.ts) and [src/services/prompts.ts](src/services/prompts.ts).
- Shared types (`Step`, `VitalSigns`, `StressAnalysis`, `RoutingResult`, `InterventionType`, `LLMFlag`) are in [src/types/index.ts](src/types/index.ts).

### Project layout

```
src/
├── App.tsx                  # state machine + orchestration
├── main.tsx                 # React bootstrap
├── components/              # 16 UI components + co-located CSS
├── services/
│   ├── llm.ts               # OpenAI/Gemini client
│   └── prompts.ts           # Ori persona + context-aware builders
├── types/index.ts           # shared TypeScript types
├── App.css, index.css       # global tokens + layout
└── assets/
```

---

## Setup

### Prerequisites

- **Node.js 20+** and **npm** (Vite 8 and `@types/node` 24 are the floor).
- **Python 3.11+** for the backend.
- An API key from **either** [OpenAI](https://platform.openai.com/api-keys) **or** [Google AI Studio](https://aistudio.google.com/app/apikey).

### Install and run

```bash
git clone <repo-url>
cd ori-guided

# Backend (terminal 1)
cd server
python -m venv .venv && source .venv/bin/activate
pip install -e .
cp .env.example .env        # set LLM_PROVIDER + matching *_API_KEY
python manage.py migrate
python manage.py runserver 8000

# Frontend (terminal 2)
cd ..
npm install
cp .env.example .env        # already points at http://localhost:8000
npm run dev
```

The dev server starts at <http://localhost:5173>.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and produce a production bundle in `dist/` |
| `npm run preview` | Serve the built bundle locally |
| `npm run lint` | Run ESLint |

### First-time configuration

Configuration lives in two `.env` files:

- `server/.env` — `LLM_PROVIDER` (`openai` or `gemini`), the matching `OPENAI_API_KEY` or `GEMINI_API_KEY`, and `CORS_ALLOWED_ORIGINS` (default `http://localhost:5173`).
- `.env` at the repo root — `VITE_API_BASE_URL` (default `http://localhost:8000`).

The provider key never reaches the browser. To switch providers, edit `server/.env` and restart the backend.

---

## Decision rationale

Short notes on the non-obvious choices.

**Server-held LLM keys (v2.1).** The browser no longer talks to OpenAI / Gemini directly — all five LLM calls are proxied through `/api/llm/*` on the Django backend, which holds the key in a server env var. See [server/README.md](server/README.md).

**Step machine instead of a router.** The flow is strictly linear with one conditional branch (follow-up). Did not implement a router to keep things simple.

**CORS allow-list, no auth yet.** Access is gated by exact-origin CORS only. Auth and rate limits are intentionally deferred to v2.2 / v2.1-followup. Until both ship, do not expose the API on a public URL — anyone who finds it can burn provider credits.

---

## Safety

The Ori system prompt in [src/services/prompts.ts](src/services/prompts.ts) instructs the model to stop coaching and surface hotlines — **Crisis Text 741741**, **Suicide Prevention 988**, or **911** — when it detects acute mental-health risk (suicidal ideation, self-harm, domestic violence, emergency). This app is not a substitute for clinical care.

---

## Roadmap

**v2 — Foundation.** Backend + server-held LLM keys (remove browser-direct calls), user accounts and authentication, Postgres-backed session history with encrypted free-text, a `/history` view of past prescription cards, first-party telemetry.

**v3 — Intelligence + integrations.** Personalized analysis and routing from user history, calendar integration for pre-event rehearsals and post-meeting resets, React Native app with wearable integration (HRV / HR spikes) for proactive check-ins with user-set thresholds and quiet hours, and opt-in read-only session sharing with a coach or therapist.
