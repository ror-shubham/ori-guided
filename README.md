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

React 19 · TypeScript 6 · Vite 8. Pure frontend — no backend, no database. The LLM is called directly from the browser using a user-supplied **OpenAI** (`gpt-4o-mini`) or **Google Gemini** (`gemini-2.5-flash`) API key.

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
- An API key from **either** [OpenAI](https://platform.openai.com/api-keys) **or** [Google AI Studio](https://aistudio.google.com/app/apikey).

### Install and run

```bash
git clone <repo-url>
cd ori-guided
npm install
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

There is no `.env` and no backend — **configuration happens at runtime through the UI**.

On first load, you'll see an API key setup screen:

1. Pick a provider (**OpenAI** or **Gemini**).
2. Paste your key.
3. The key is stored in your browser's `localStorage` under `ori_api_key` and `ori_llm_provider`. It never leaves your browser except in outbound calls to the provider you selected.
4. A **"Reset API Key"** button is always available in the top bar if you want to switch providers or clear credentials.

---

## Decision rationale

Short notes on the non-obvious choices.

**No backend.** Due to time constraints, the app is frontend only. This further simplified deployment (used Github Pages)


**Step machine instead of a router.** The flow is strictly linear with one conditional branch (follow-up). Did not implement a router to keep things simple.


**`localStorage` insted of `env variable`for the API key.** There's no backend to hold the key, frontend will expose the key while calling opean-ai, if key is stored in env variable. Falling back to user provided key for prototype

---

## Safety

The Ori system prompt in [src/services/prompts.ts](src/services/prompts.ts) instructs the model to stop coaching and surface hotlines — **Crisis Text 741741**, **Suicide Prevention 988**, or **911** — when it detects acute mental-health risk (suicidal ideation, self-harm, domestic violence, emergency). This app is not a substitute for clinical care.

---

## Roadmap

**v2 — Foundation.** Backend + server-held LLM keys (remove browser-direct calls), user accounts and authentication, Postgres-backed session history with encrypted free-text, a `/history` view of past prescription cards, first-party telemetry.

**v3 — Intelligence + integrations.** Personalized analysis and routing from user history, calendar integration for pre-event rehearsals and post-meeting resets, React Native app with wearable integration (HRV / HR spikes) for proactive check-ins with user-set thresholds and quiet hours, and opt-in read-only session sharing with a coach or therapist.
