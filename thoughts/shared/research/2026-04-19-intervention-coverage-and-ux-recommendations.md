---
date: 2026-04-19T23:15:00Z
researcher: Claude Code
git_commit: N/A
branch: main
repository: ori-guided
topic: "Comprehensive Intervention Coverage and UX Analysis"
tags: [research, interventions, ux, design-system, feature-gaps]
status: complete
last_updated: 2026-04-19
last_updated_by: Claude Code
---

# Research: Intervention Coverage and UX Design System

**Date**: 2026-04-19
**Researcher**: Claude Code
**Repository**: ori-guided

## Research Question

What types of interventions exist in the codebase? What are the gaps in intervention coverage? Which interventions should be created next and how? What are the UX best practices and design patterns?

## Summary

The ori-guided application implements a **6-intervention therapeutic system** with a sophisticated routing matrix that matches user signals (mood, energy, stress location, LLM-detected patterns) to appropriate interventions. Currently, **2 interventions are fully implemented** (breathing, cognitive reframe) while **4 are defined but fall back to these implementations**.

The application demonstrates excellent design system maturity with:
- Cohesive animation and transition patterns
- Consistent component architecture and state management
- Sophisticated routing logic that handles edge cases
- Strong accessibility foundations
- Well-organized CSS with design tokens

**Key Gaps**:
1. **Grounding exercise** not yet implemented (currently falls back to breathing)
2. **Movement reset** not implemented (falls back to breathing; requires space disclaimer)
3. **Journaling/processing prompt** not implemented (falls back to cognitive reframe)
4. **Mental rehearsal** not implemented (falls back to cognitive reframe)
5. **Limited UX feedback** for fallback interventions (users don't know they're using alternatives)
6. **No progressive disclosure** for unimplemented features

**Priority Recommendations**:
1. Implement **grounding exercise** (5-4-3-2-1 sensory anchoring) - high routing frequency
2. Implement **journaling prompt** (structured processing) - improves low-mood handling
3. Create **movement guidance** with space requirements disclaimer
4. Add **intervention differentiation messaging** to help users understand why they received certain options

---

## Detailed Findings

### 1. Intervention Types and Current Implementation Status

#### Defined Interventions (6 total)
From [src/types/index.ts:10-16](src/types/index.ts#L10-L16):

```typescript
type InterventionType = 'breathing' | 'grounding' | 'movement' | 'reframe' | 'journaling' | 'rehearsal'
```

#### Implementation Matrix

| Intervention | Status | Component File | Fully Interactive | Notes |
|---|---|---|---|---|
| **breathing** | ✓ Implemented | BreathingExercise.tsx | Yes | 4-4-4-4 box breathing, 3 cycles, ~1 min |
| **reframe** | ✓ Implemented | CognitiveReframe.tsx | Yes | Prompt-based cognitive shift, optional reflection |
| **grounding** | ✗ Fallback | → BreathingExercise | No | Falls back to breathing; needs 5-4-3-2-1 implementation |
| **movement** | ✗ Fallback | → BreathingExercise | No | Falls back to breathing; needs space disclaimer |
| **journaling** | ✗ Fallback | → CognitiveReframe | No | Falls back to reframe; needs structured journal prompts |
| **rehearsal** | ✗ Fallback | → CognitiveReframe | No | Falls back to reframe; needs pre-event visualization |

**Source**: [App.tsx:190-206](App.tsx#L190-L206) shows the fallback mapping in `renderIntervention()` function.

#### Metadata and Display Properties

From [ReflectionStep.tsx:5-12](ReflectionStep.tsx#L5-L12) and [PrescriptionCard.tsx:4-20](PrescriptionCard.tsx#L4-L20):

| Intervention | Display Name | Duration | Icon | Description |
|---|---|---|---|---|
| breathing | Box Breathing Reset | ~1 minute | 🌬 | restores calm |
| grounding | Grounding Exercise | ~2 minutes | 🫂 | anchors presence |
| movement | Movement Reset | ~90 seconds | 🔄 | releases tension |
| reframe | Cognitive Reframe / Perspective Shift | ~3 minutes | ✨ | shifts thinking |
| journaling | Processing Prompt | ~5 minutes | 📝 | work through it |
| rehearsal | Mental Rehearsal | ~3 minutes | 🎯 | prepare & frame |

---

### 2. Routing Logic and Signal-Based Selection

#### Routing Architecture

The system uses a **4-tier routing hierarchy** (from [llm.ts:136-184](src/services/llm.ts#L136-L184)):

**TIER 0: Mood + Context Override** (Lowest energy state)
- `mood ≤ 2 AND context='after'` → **journaling** (process past events)
- `mood ≤ 2 AND context='before'` → **rehearsal** (prepare for future events)

**TIER 1: Energy Extremes** (Physiological override - highest priority after mood)
- `energy ≤ 2 AND llmFlag='overwhelm'` → **grounding** (cognitive reset when overloaded)
- `energy ≤ 2 AND weight='body'` → **breathing** (somatic regulation when depleted)
- `energy ≤ 2 AND weight='head'` → **grounding** (mental clarity when depleted)
- `energy ≥ 4 AND weight='body'` → **movement** (physical discharge when energized)
- `energy ≥ 4 AND weight='head'` → **reframe** (harness mental energy)

**TIER 2: Moderate Energy** (3-3 state, weight-location driven)
- `weight='body' AND llmFlag='tension'` → **breathing**
- `weight='body' AND other flag` → **breathing** (default body → breathing)
- `weight='head' AND llmFlag='rumination'` → **reframe** (break thought loops)
- `weight='head' AND other flag` → **grounding** (mental reset)
- `weight='both' AND mood ≤ 2` → **grounding** (mood override)
- `weight='both' AND energy ≤ 3` → **breathing** (conservative choice)
- `weight='both' AND energy ≥ 4` → **reframe** (mental channeling)

**TIER 3: Fallback**
- Default → **breathing** (universal accessibility)

#### Signal Types

**Vital Signs** ([types/index.ts:30-35](src/types/index.ts#L30-L35)):
- `mood`: 1-5 scale (1=struggling, 5=great)
- `energy`: 1-5 scale (1=depleted, 5=energized)
- `weightLocation`: 'head' | 'body' | 'both'
- `contextTrigger`: 'before' | 'during' | 'after' | 'general'

**LLM-Detected Flags** ([types/index.ts:18](src/types/index.ts#L18)):
- `overwhelm` - Multiple stressors, unable to cope
- `rumination` - Looping/repetitive thinking
- `fatigue` - Depletion, low capacity
- `tension` - Physical tightness, restlessness
- `neutral` - Mixed or unclear pattern

#### Alternative Intervention Mapping

From [llm.ts:187-207](src/services/llm.ts#L187-L207). When users click "Something else?":

| Primary | Alternative |
|---------|-------------|
| breathing ↔ grounding | Bidirectional swap (both calming modalities) |
| reframe → grounding | Reframe flexibility → anchor (can't think → ground) |
| movement → breathing | Movement to calm (high energy → parasympathetic) |
| journaling → breathing | Processing to calm (emotional work → regulation) |
| rehearsal → grounding | Preparation to anchor (fear-based → grounding) |

**Design insight**: Movement is never offered as an alternative (requires physical space). Breathing is the most accessible fallback.

---

### 3. Fully Implemented Interventions: UX and Architecture

#### A. Breathing Exercise Component

**File**: [src/components/BreathingExercise.tsx](src/components/BreathingExercise.tsx)
**Duration**: ~1 minute
**Pattern**: Box breathing (4-4-4-4 seconds per phase, 3 cycles)

**Component Structure**:
- **Props**: `onComplete: () => void` - callback when finished
- **States**: 
  - `started: boolean` - triggers intro → active transition
  - `phaseIndex: 0-3` - current breathing phase position
  - `cycle: 1-3` - which breathing cycle
  - `countdown: 4-1` - seconds remaining in current phase
  - `finished: boolean` - triggers active → complete transition

**User Flow**:
1. **Intro screen**: "I'm Ready" button to start
2. **Active exercise**: Fully automated, user follows visual cues
   - Breathing circle expands/contracts with 4s transitions
   - Countdown timer in center (2.5rem bold display font)
   - Phase dots (4) track progress visually
   - Cycle label ("Cycle X of 3")
   - Phase labels ("Breathe In", "Hold", etc.)
   - NO interaction needed during exercise
3. **Completion**: Shows checkmark icon + affirmation + "See My Summary" button

**Key UX Features**:
- **Visual feedback**: Multi-layered box shadows create breathing glow effect
  - Inner shadow: 40px blur (primary accent green)
  - Outer shadow: 100px blur (expansion effect)
  - 4s transition synchronized with breathing phases
- **Progress tracking**: 
  - Phase dots (8px circles) show complete/current/pending states
  - Cycle label provides context ("Cycle 1 of 3")
  - Visual scale: 100px (exhale) → 180px (inhale)
- **Accessibility**:
  - Large countdown text (2.5rem) for visibility
  - Color + position changes (not color-only indicators)
  - Semantic headings for phase labels
  - Explicit button IDs for testing

**CSS Patterns** ([BreathingExercise.css](src/components/BreathingExercise.css)):
- Phase-specific CSS classes: `.inhale`, `.hold-in`, `.exhale`, `.hold-out`
- Unified 4s transition: `transition: all 4s ease-in-out`
- Pulse animation for intro state: `animation: staticPulse 3s ease-in-out infinite`
- Completion checkmark animation: `animation: checkmarkAppear 600ms var(--ease-spring)`

**Strengths**:
- ✓ Perfectly paired animation to breathing physiology
- ✓ No user input required during exercise (full focus on breathing)
- ✓ Clear visual progress tracking
- ✓ Calming color scheme (green accent with glow)

---

#### B. Cognitive Reframe Component

**File**: [src/components/CognitiveReframe.tsx](src/components/CognitiveReframe.tsx)
**Duration**: ~3 minutes
**Pattern**: Prompt → reflection (optional) → completion

**Component Structure**:
- **Props**: 
  - `analysis: StressAnalysis` - contains LLM-generated reframe prompt
  - `onComplete: () => void` - callback when finished
- **States**:
  - `phase: 'prompt' | 'reflect' | 'done'` - UI state
  - `reflection: string` - user's textarea content
  - `textareaRef: RefObject<HTMLTextAreaElement>` - focus management

**User Flow**:
1. **Prompt screen**: 
   - Icon badge (warm-colored location pin icon in circle)
   - Prompt card with italic reframe question + left decoration bar
   - Two action buttons: "Skip to Summary" OR "Write My Thoughts"
2. **Reflect screen** (optional path):
   - Same prompt visible
   - Textarea auto-focuses (400ms delay for animation)
   - "Done Reflecting" button
   - Placeholder: "What comes to mind..."
3. **Done screen**:
   - Checkmark icon + affirmation message
   - "See My Summary" button

**Key UX Features**:
- **Choice architecture**: Users can skip if not in mood for writing
  - "Skip" path: bypass reflection, go straight to summary
  - "Reflect" path: engage in guided thought work
- **Focus management**: 
  - `useEffect` with 400ms setTimeout delays focus until slide-up animation completes
  - Prevents jarring layout shift from focus ring
- **Visual hierarchy**:
  - Icon badge: 48px circle with warm glow background
  - Prompt text: Italic (philosophical framing), 1.125rem display font
  - Description text: Secondary text color for visual weight
- **Warm color palette**: Distinct from breathing's green
  - Icon background: `--accent-warm-glow` (12% opacity tan)
  - Icon color: `#c4915e` (warm tan)
  - Decoration bar: Warm gradient left border

**CSS Patterns** ([CognitiveReframe.css](src/components/CognitiveReframe.css)):
- Icon container: `border: 1px solid rgba(196, 145, 94, 0.2)`
- Prompt card: `border-left: 4px solid` with warm gradient
- Textarea: 100px min-height, full-width
- Focus state: 3px focus ring + glow shadow + background color shift

**Strengths**:
- ✓ Flexible UX (skip option respects user agency)
- ✓ Optional reflection respects emotional capacity
- ✓ Warm color scheme contrasts with breathing's cool green
- ✓ Auto-focus with animation delay shows attention to detail

---

### 4. Unimplemented Interventions: Design Gaps and Recommendations

#### Gap 1: Grounding Exercise (Currently → Breathing Fallback)

**Current Mapping**: All grounding requests render BreathingExercise component

**Differentiation Needed**:
The 5-4-3-2-1 grounding technique is fundamentally different from breathing:
- **Focus**: Sensory anchoring (external focus) vs physiological regulation (internal focus)
- **Duration**: ~90 seconds vs breathing's 60 seconds
- **Interaction**: Text-based sensory prompts vs visual animation
- **Routing context**: Used 5+ times in tier 1/2:
  - `energy ≤ 2 AND llmFlag='overwhelm'` (cognitive overload needs anchoring)
  - `energy ≤ 2 AND weight='head'` (mental fog needs external focus)
  - `weight='head' AND llmFlag!='rumination'` (general head tension)
  - `weight='both' AND mood ≤ 2` (overwhelm + low mood)
  - As alternative to reframe (when thinking doesn't help, anchor instead)

**Recommended Implementation**:

```
┌─────────────────────────────────────┐
│    Grounding Exercise               │
│                                     │
│    Anchor yourself with             │
│    your five senses                 │
│                                     │
│    [Timer showing 90s]              │
├─────────────────────────────────────┤
│                                     │
│    👁  5 things you see             │
│    [Visual: rotating items listed]  │
│                                     │
│    👂 4 things you hear             │
│    [Visual: sound waves or items]   │
│                                     │
│    ✋ 3 things you feel             │
│    [Text prompt]                    │
│                                     │
│    👃 2 things you smell            │
│    [Text prompt]                    │
│                                     │
│    👅 1 thing you taste             │
│    [Text prompt]                    │
├─────────────────────────────────────┤
│         [Grounding Complete]        │
│      [See My Summary Button]        │
└─────────────────────────────────────┘
```

**UX Design Considerations**:
1. **Phase progression**: 5 → 4 → 3 → 2 → 1 (descending for drama)
2. **Timing**: ~15-20 seconds per sense
3. **Interaction**: Guided prompts (user reads/reflects, doesn't necessarily type)
4. **Visual feedback**: 
   - Sense icon per phase (eyes, ears, fingers, nose, tongue)
   - Color scheme: Could use secondary accent color (distinct from breathing's green)
   - Progress: Descending counter (5... 4... 3... 2... 1)
5. **Accessibility**:
   - Text descriptions for each sense category
   - Audio option for readability ("5 things you see...")
   - Large button text and spacing

**Code Architecture** (consistent with existing patterns):
- Component: `GroundingExercise.tsx` (parallel to BreathingExercise.tsx)
- Props: `onComplete: () => void`
- States: `phase: 0-4`, `timeRemaining: number`
- Entrance animation: `.slide-up` with delay cascade
- Completion: Standard checkmark + affirmation pattern

**Priority**: **HIGH** (routed 5+ times, fills critical gap for overwhelm/head-focused stress)

---

#### Gap 2: Movement Reset (Currently → Breathing Fallback)

**Current Mapping**: Movement requests render BreathingExercise component

**Differentiation Needed**:
Movement is a fundamentally different modality for high-energy states:
- **Focus**: Physical discharge and tension release (vs internal regulation)
- **Duration**: ~90 seconds
- **Constraint**: Requires physical space (explicitly noted in routing code)
- **Routing context**: Used 1-2 times in tier 1:
  - `energy ≥ 4 AND weight='body'` (high energy + physical tension)
- **Never an alternative** (because of space requirements)

**Recommended Implementation**:

```
┌─────────────────────────────────────┐
│    Movement Reset                   │
│                                     │
│    ⚠️  This exercise needs space    │
│    Make sure you have room to move. │
│                                     │
│    [Space Requirements Icon]        │
│    - 2-3 feet of clear space        │
│    - Comfortable to stretch         │
│    - Safe flooring preferred        │
│                                     │
│    [Ready to Begin?]                │
│    [ Begin ] or [ Choose Different] │
├─────────────────────────────────────┤
│  [Movement sequence with timer]     │
│                                     │
│  🔄 Arm circles: 20 seconds         │
│     (animated figure showing)       │
│                                     │
│  🧘 Torso twists: 20 seconds        │
│     (animated figure showing)       │
│                                     │
│  🏃 Marching in place: 20 seconds   │
│     (animated figure showing)       │
│                                     │
│  🤸 Gentle jumping jacks: 20 seconds│
│     (optional, with warning)        │
│                                     │
│  🪜 Cool-down stretch: 10 seconds   │
├─────────────────────────────────────┤
│      [Movement Complete!]           │
│    [See My Summary Button]          │
└─────────────────────────────────────┘
```

**UX Design Considerations**:
1. **Disclaimer screen**: Space requirements, noise considerations
2. **Animated guidance**: Stick figure or simple character showing movements
3. **Clear instructions**: Large text, explicit movement names
4. **Timing feedback**: Countdown for each movement phase
5. **Safety**: 
   - Avoid high-impact movements (jumping jacks could be optional)
   - Clear start/stop boundaries
   - No balance challenges (risk of injury)
6. **Audio option**: Could provide voiceover guidance (optional)

**Code Architecture**:
- Component: `MovementReset.tsx`
- Props: `onComplete: () => void`
- States: `showDisclaimer: boolean`, `phase: 0-4`, `timeRemaining: number`
- Entrance: Disclaimer card → Begin button → movement sequence
- Completion: Standard pattern

**Priority**: **MEDIUM** (routed only 1-2 times, but important for high-energy/body-tense users)

---

#### Gap 3: Journaling/Processing Prompt (Currently → Cognitive Reframe Fallback)

**Current Mapping**: Journaling requests render CognitiveReframe component

**Differentiation Needed**:
Journaling is fundamentally different from reframing:
- **Focus**: Processing and working through past events (vs perspective shift)
- **Duration**: ~5 minutes (longer than reframe's 3 minutes)
- **Interaction**: Structured reflection prompts vs single perspective question
- **Routing context**: Used 1 time in tier 0:
  - `mood ≤ 2 AND context='after'` (struggling after stressful event)

**Recommended Implementation**:

```
┌─────────────────────────────────────┐
│   Processing Prompt                 │
│                                     │
│   📝 Work through what happened     │
│                                     │
│   Let's process this together       │
├─────────────────────────────────────┤
│                                     │
│  1️⃣  What happened?                 │
│  [Textarea: 80px height]            │
│  Placeholder: "Describe the event"  │
│                                     │
│  💭 How did it make you feel?       │
│  [Textarea: 80px height]            │
│  Placeholder: "What emotions..."    │
│                                     │
│  🎯 What matters most about this?   │
│  [Textarea: 80px height]            │
│  Placeholder: "What's important..."│
│                                     │
│  ➡️  Moving forward, what's one     │
│      small step you can take?       │
│  [Textarea: 80px height]            │
│  Placeholder: "What will you do..."│
│                                     │
│    [Done Processing]                │
├─────────────────────────────────────┤
│      [Processing Complete!]         │
│    [See My Summary Button]          │
└─────────────────────────────────────┘
```

**UX Design Considerations**:
1. **Structured prompts**: 4 guided questions (event → emotion → meaning → action)
2. **Phased progression**: One question at a time, or all visible at once (test both)
3. **Duration**: ~1.5-2 minutes per prompt = 5 minutes total
4. **Skip option**: Allow skipping difficult prompts, jumping to summary
5. **Warm color scheme**: Different from reframe (could use secondary warm accent)
6. **Emotional support**: 
   - Reassuring tone in prompts ("Let's work through this...")
   - Validation messaging ("It's natural to feel this way")
   - Growth-oriented final prompt ("Moving forward...")

**Code Architecture**:
- Component: `JournalingPrompt.tsx`
- Props: `analysis: StressAnalysis`, `onComplete: () => void`
- States: `currentPrompt: 0-3`, `responses: string[]`, `showAll: boolean`
- Entrance: Intro card → prompts (staggered) → completion
- Completion: Standard pattern with affirmation about processing

**Priority**: **MEDIUM-HIGH** (routed 1 time, but critical for low-mood/"after" users who need processing)

---

#### Gap 4: Mental Rehearsal (Currently → Cognitive Reframe Fallback)

**Current Mapping**: Rehearsal requests render CognitiveReframe component

**Differentiation Needed**:
Rehearsal is fundamentally different from reframing:
- **Focus**: Pre-event visualization and confidence building (vs perspective on current state)
- **Duration**: ~3 minutes
- **Interaction**: Guided visualization vs analytical reframing
- **Routing context**: Used 1 time in tier 0:
  - `mood ≤ 2 AND context='before'` (struggling before upcoming event)

**Recommended Implementation**:

```
┌─────────────────────────────────────┐
│   Mental Rehearsal                  │
│                                     │
│   🎯 Prepare yourself mentally      │
│                                     │
│   Get ready for what's ahead        │
├─────────────────────────────────────┤
│                                     │
│  What's the situation you're        │
│  preparing for?                     │
│  [Textarea: 60px]                   │
│  Placeholder: "Meeting, call,..."   │
│                                     │
│  [Step 1/3: Visualize Success]      │
│  [5s timer]                         │
│  Close your eyes and imagine        │
│  yourself handling this well...     │
│  (Guide: "You walk in confident...│
│   You speak clearly... You handle  │
│   questions with ease...")         │
│                                     │
│  [Step 2/3: Anchor Your Strength]   │
│  [5s timer]                         │
│  What's one strength you have that  │
│  will help?                         │
│  [Textarea: 40px]                   │
│  Placeholder: "I'm calm, prepared"  │
│                                     │
│  [Step 3/3: Set Your Intention]     │
│  [5s timer]                         │
│  What's one thing you want to       │
│  remember going in?                 │
│  [Textarea: 40px]                   │
│  Placeholder: "I've done hard..."   │
│                                     │
│    [Ready to Begin]                 │
├─────────────────────────────────────┤
│   [Mental Rehearsal Complete!]      │
│  You're prepared for this.          │
│    [See My Summary Button]          │
└─────────────────────────────────────┘
```

**UX Design Considerations**:
1. **Event context**: Ask user what they're preparing for upfront
2. **Visualization guidance**: Provide specific prompts (walk in confident, speak clearly)
3. **Strength anchoring**: Identify personal strengths relevant to situation
4. **Intention setting**: Crystallize one key thought to carry forward
5. **Tone**: Confidence-building, aspirational language
6. **Timing**: 3-4 minutes total (including guidance text)
7. **Optional voiceover**: Could provide guided visualization audio

**Code Architecture**:
- Component: `MentalRehearse.tsx`
- Props: `analysis: StressAnalysis`, `onComplete: () => void`
- States: `situation: string`, `step: 0-3`, `responses: string[]`
- Entrance: Situation input → visualization guidance → strength + intention prompts
- Completion: Affirmation about preparation

**Priority**: **MEDIUM** (routed 1 time, addresses pre-event anxiety effectively)

---

### 5. Design System Maturity and UX Patterns

#### Global Design System ([index.css](src/index.css) + [App.css](src/App.css))

**Color Palette** (Nature-inspired, dark mode):
- **Primary accent (green)**: `#4a9e75` with glow variant `rgba(74, 158, 117, 0.15)`
- **Secondary accent (warm tan)**: `#c4915e` with glow variant `rgba(196, 145, 94, 0.15)`
- **Background tiers**: 
  - Primary: `#0a0f0d`
  - Secondary: `#111916`
  - Card: `#151d19`
- **Text tiers**:
  - Primary: `#e8ede6`
  - Secondary: `#9aaa9e`
  - Muted: `#5e7268`

**Typography**:
- **Display font**: Playfair Display (serif, 500-700 weight)
  - Headings: 1.5rem-2.25rem
  - Italic for emphasis and quotations
- **Body font**: Inter (sans-serif)
  - Body text: 1rem, 1.7 line-height
  - Small text: 0.875rem, 1.6 line-height
  - Labels: 0.75rem, uppercase, 0.08em letter-spacing

**Spacing System**:
- Base unit: 0.25rem (--space-xs)
- Scale: xs (0.25) → 3xl (4) [multiplicative scale]
- Consistent gap usage with flexbox

**Border Radius**:
- sm: 8px, md: 12px, lg: 16px, xl: 24px, full: 9999px
- Scales with component size (buttons=full, cards=lg, inputs=sm)

**Animation Easing**:
- `--ease-out`: cubic-bezier(0.16, 1, 0.3, 1) - snappy, natural exit
- `--ease-spring`: cubic-bezier(0.34, 1.56, 0.64, 1) - bouncy, overshoot

**Animation Duration**:
- `--duration-fast`: 150ms (hover, focus states)
- `--duration-normal`: 300ms (interactions, state changes)
- `--duration-slow`: 500ms (entrance animations, major transitions)
- Breathing phase: 4s (synchronized with breathing physiology)

#### Common UX Patterns

**1. Multi-State Component Pattern**
All interventions follow state machine architecture:
```
BreathingExercise: intro → active → complete
CognitiveReframe: prompt → reflect → done
GroundingExercise: intro → phases (5→1) → complete
```

**2. Cascading Entrance Animations**
Global `.slide-up` base + delay variants (100ms increments):
```css
.slide-up { animation: slideUp 500ms ease-out forwards; }
.slide-up-delay-1 { animation-delay: 100ms; }
.slide-up-delay-2 { animation-delay: 200ms; }
.slide-up-delay-3 { animation-delay: 300ms; }
.slide-up-delay-4 { animation-delay: 400ms; }
```

**3. Completion State Pattern** (Reusable across all interventions)
```
Checkmark icon (48px circle, spring bounce animation)
  ↓
Affirmation heading ("Well done", "Nicely done", etc.)
  ↓
Body text affirming the action
  ↓
"See My Summary" button with arrow icon
```

**4. Callback-Based Completion**
All interventions pass `onComplete: () => void` prop:
```tsx
<BreathingExercise onComplete={handleInterventionComplete} />
```
Parent handles state progression and navigation.

**5. Alternative Selection Pattern** (Used in ReflectionStep)
```
Primary recommendation card (selected by default)
  ↓
"Something else?" button reveals alternatives
  ↓
Two-choice grid (primary + alternative)
  ↓
"Selected" badge on chosen intervention
  ↓
"Begin [Intervention]" button confirms choice
```

**6. Icon + Label Badge Pattern**
Used for intervention identification and visual recognition:
```
[Icon] [Name]
[Description/Duration]
```
Consistent across ReflectionStep and PrescriptionCard.

**7. SVG Button Icons**
Consistent arrow icons indicating forward progression:
- Arrow pointing right: "→"
- Rotation icon for restart
- Checkmark for confirmation
- Lightbulb for tips

**8. Design Tokens in CSS**
All magic numbers are CSS custom properties:
```css
--accent-primary, --accent-warm, --accent-glow
--bg-primary, --bg-secondary, --bg-input
--text-primary, --text-secondary, --text-muted
--space-sm, --space-md, --space-lg
--duration-fast, --duration-slow, --ease-spring
--radius-md, --radius-lg
```

**9. Focus State Pattern**
Consistent interactive feedback:
```css
focus: {
  outline: 3px solid var(--accent-primary);
  box-shadow: 0 0 0 4px var(--accent-glow);
  background: var(--bg-input);
}
```

**10. Button Hierarchy**
- **Primary (`.btn-primary`)**: Gradient background, prominent, calls main action
- **Secondary (`.btn-secondary`)**: Transparent, bordered, secondary action
- **Escape hatch (`.btn-escape-hatch`)**: Tertiary action ("Something else?")

---

### 6. Key Gaps Identified

#### Functional Gaps
1. **No grounding exercise implementation** (routed 5+ times)
2. **No movement guidance with disclaimer** (routed 1-2 times, requires space context)
3. **No structured journaling/processing** (routed 1 time for post-event processing)
4. **No pre-event visualization/rehearsal** (routed 1 time for pre-event anxiety)
5. **Fallback messaging is silent** - Users don't know breathing is standing in for grounding

#### UX Gaps
1. **No differentiation between primary and fallback interventions**
   - Users receive breathing for both grounding and movement requests
   - They don't understand why they're getting a breathing exercise when they selected grounding
   
2. **No indicator that alternatives are available**
   - "Something else?" button appears only after Ori's transition message
   - No visual hint that choices exist upfront

3. **Limited feedback on why routing decisions were made**
   - PrescriptionCard shows "Based on how your body was feeling..." but doesn't explain routing logic
   - Users don't understand the signal-to-intervention mapping

4. **No progressive disclosure for unimplemented features**
   - System doesn't signal which interventions are fully implemented vs falling back
   - Could confuse users who expect grounding to behave differently than breathing

5. **Alternative mapping could be more explicit**
   - Users might not understand why grounding is offered as alternative to breathing
   - Could benefit from brief explanation of why this alternative matches their state

#### Technical Gaps
1. **PatternReveal component unused** (reference implementation, could be refactored)
2. **No intervention-specific LLM prompts** - All reframe requests use same system prompt
3. **No intervention efficacy tracking** - Can't measure which interventions users complete vs abandon

---

### 7. Implementation Recommendations

#### Priority 1: Grounding Exercise (HIGH PRIORITY)

**Why**: 
- Routed 5+ times across multiple signal profiles
- Fundamentally different modality from breathing (sensory anchoring vs physiological)
- Fills critical gap for overwhelm + head-tension states

**How**:
1. Create `GroundingExercise.tsx` component (parallel to `BreathingExercise.tsx`)
2. Implement 5-4-3-2-1 sensory technique
3. 15-20 seconds per sense = ~90 seconds total
4. Visual design: 
   - Use secondary visual treatment (different from green breathing)
   - Sense-specific icons (eyes, ears, fingers, nose, tongue)
   - Descending counter (5, 4, 3, 2, 1) for visual metaphor
5. Update `App.tsx` renderIntervention() to use new component
6. Add to component imports and routing

**Effort**: Medium (2-3 hours)
**Impact**: High (covers critical gap, improves UX for overwhelm/anxiety)

---

#### Priority 2: Add Fallback Messaging (MEDIUM PRIORITY)

**Why**:
- Users don't understand why they're receiving certain interventions
- Silent fallbacks create expectation mismatch (users expect grounding != breathing)

**How**:
1. Modify ReflectionStep to show intervention status:
   ```
   Primary: "Grounding Exercise" (with icon)
   Status badge: "Based on your stress pattern"
   Or: "This breathing technique will anchor your nervous system"
   ```

2. Add brief explanation in intervention component headers:
   ```
   When grounding falls back to breathing:
   "Breathing Reset
    This focused breathing will help ground your nervous system
    when you're feeling overwhelmed."
   ```

3. Update PrescriptionCard to explain why this specific intervention:
   ```
   Current: "Based on how your body was feeling, Breathing Reset was the right reset for this moment."
   Enhanced: "Based on your state of overwhelm, we used breathing as an anchor. 
              This technique grounds your nervous system by syncing
              your body's rhythm."
   ```

**Effort**: Low (1-2 hours, mostly messaging updates)
**Impact**: Medium (improves user understanding, reduces confusion)

---

#### Priority 3: Journaling Prompt (MEDIUM-HIGH PRIORITY)

**Why**:
- Routed when mood ≤ 2 AND context='after' (low mood + past events)
- Currently falls back to reframe (wrong modality for processing)
- Users in low mood need processing more than perspective shift

**How**:
1. Create `JournalingPrompt.tsx` component
2. Implement 4-question structured journal:
   - "What happened?"
   - "How did it make you feel?"
   - "What matters most about this?"
   - "What's one small step forward?"
3. Visual design:
   - Warm color palette (secondary accent distinct from reframe)
   - Phased or all-visible layout (test preference)
   - Comfortable, non-judgmental tone
4. Update App.tsx routing

**Effort**: Medium (2-3 hours)
**Impact**: Medium-High (improves emotional processing, addresses low-mood users)

---

#### Priority 4: Movement Reset with Space Disclaimer (MEDIUM PRIORITY)

**Why**:
- Routed when energy ≥ 4 AND weight='body' (high energy + physical tension)
- Requires space disclaimer (design constraint noted in routing code)
- Never offered as alternative (respects environmental constraints)

**How**:
1. Create `MovementReset.tsx` component
2. Implement space requirement disclaimer screen
3. Animated movement guidance (stick figure or character)
4. 4-5 movement phases × ~20s each = ~90 seconds
5. Consider optional voiceover guidance
6. Update App.tsx routing

**Effort**: Medium-High (3-4 hours, animation complexity)
**Impact**: Medium (serves smaller population, but important for high-energy discharge)

---

#### Priority 5: Mental Rehearsal (LOWER PRIORITY)

**Why**:
- Routed only once (mood ≤ 2 AND context='before')
- Addresses pre-event anxiety (smaller use case)
- Different from other modalities (pre-event visualization)

**How**:
1. Create `MentalRehearse.tsx` component
2. Implement 3-step structure:
   - Situation input
   - Visualization guidance
   - Strength + intention prompts
3. ~3 minute duration total
4. Confidence-building tone

**Effort**: Medium (2-3 hours)
**Impact**: Low-Medium (serves smaller population, but highly effective for anxiety)

---

### 8. UX Recommendations for Existing Interventions

#### A. Breathing Exercise Enhancements

**Current strengths**: Perfect animation, clear progress, no user input during exercise

**Potential improvements**:
1. **Add pre-exercise calibration** (optional):
   - Ask: "How many cycles would help you right now?" (default 3)
   - Let users customize to their time availability
   - Could reduce abandonment for users with limited time

2. **Post-exercise breathing check**:
   - After exercise: "How does your body feel now?"
   - Brief 1-click feedback (scale of 1-5)
   - Helps track intervention efficacy

3. **Visual onboarding**:
   - On first use, show breathing circle animation in intro state
   - "Watch the circle expand and contract - sync your breathing"
   - Educates users what to do

#### B. Cognitive Reframe Enhancements

**Current strengths**: Flexible (skip option), optional reflection, clear tone

**Potential improvements**:
1. **Reframe result visibility**:
   - After user reflects, show LLM-generated reframe
   - "Here's another way to look at this: [reframe]"
   - Validates their reflection and models perspective shift

2. **Reflection preview**:
   - Before "Done Reflecting" button: "You wrote: [preview of text]"
   - Gives users chance to review before proceeding

3. **Category-specific prompts**:
   - If rumination flag: Emphasize interrupting the loop
   - If overwhelm flag: Emphasize simplifying the problem
   - If fatigue flag: Emphasize self-compassion

#### C. ReflectionStep (Pre-Intervention Choice) Enhancements

**Current strengths**: Clear primary recommendation, simple alternative access

**Potential improvements**:
1. **Educational tooltips**:
   - Hover over intervention icon/name: Brief explanation
   - "Breathing Reset: Synchronizes your nervous system through synchronized breathing (1 minute)"
   - "Grounding: Anchors your mind in the present moment through your senses (2 minutes)"
   - Helps users make informed choices

2. **Reasoning transparency**:
   - Under Ori's transition message: Show reasoning
   - "I recommended Breathing Reset because your energy is low and your body is tense"
   - Helps users understand routing logic

3. **Duration visibility**:
   - Display duration in primary intervention card
   - "Breathing Reset · ~1 minute"
   - Helps users with time constraints choose

#### D. PrescriptionCard Enhancements

**Current strengths**: Summary of session, quotes, tips, copy-to-clipboard

**Potential improvements**:
1. **Intervention learning**:
   - Add section: "Why This Intervention Worked"
   - Explain the technique: "Box breathing syncs your nervous system..."
   - Teaches user about intervention mechanism

2. **Follow-up suggestions**:
   - "Next time you feel this way, try: [recommended intervention]"
   - Helps users remember technique for future use

3. **Session metrics** (optional):
   - "You completed 3 breathing cycles in ~1 minute"
   - "You took 2 minutes to reflect on your thoughts"
   - Shows progress, builds habit

---

### 9. Code Architecture Recommendations

#### Component Creation Template

For new intervention components, follow this pattern:

**File structure**:
```
src/components/[InterventionName].tsx
src/components/[InterventionName].css
```

**Component structure**:
```typescript
interface [InterventionName]Props {
  analysis?: StressAnalysis;  // Optional: for analysis-dependent content
  onComplete: () => void;     // Callback when intervention complete
}

export default function [InterventionName]({
  analysis,
  onComplete,
}: [InterventionName]Props) {
  // State: Multi-state pattern
  const [phase, setPhase] = useState<Phase>('intro');
  
  // Effects: Handle timing, animations
  useEffect(() => {
    // Setup timers, animations
    return () => {
      // Cleanup
    };
  }, []);
  
  // Handlers
  const handlePhaseComplete = () => {
    // Progress to next phase
  };
  
  // Render: Three states (intro → active → complete)
  return (
    <div className="[intervention]-container step-container">
      {/* Entrance animation */}
      <div className="slide-up">
        {/* Intro state */}
        {phase === 'intro' && (
          <div className="intro-content">
            {/* Brief explanation, start button */}
          </div>
        )}
      </div>
      
      {/* Active state */}
      {phase === 'active' && (
        <div className="[intervention]-active">
          {/* Main interaction or guided experience */}
        </div>
      )}
      
      {/* Complete state */}
      {phase === 'complete' && (
        <div className="slide-up">
          {/* Checkmark icon, affirmation, summary button */}
          <svg>/* Checkmark */</svg>
          <h2>Well done</h2>
          <p>Affirming message</p>
          <button onClick={onComplete}>See My Summary</button>
        </div>
      )}
    </div>
  );
}
```

**CSS pattern** ([InterventionName].css):
```css
.intervention-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  min-height: 400px;
}

.intervention-active {
  /* Main visual treatment */
}

.intervention-icon {
  /* Icon styling */
}

/* Phase-specific styles */
.phase-one { /* styles */ }
.phase-two { /* styles */ }

/* Animations */
@keyframes customAnimation {
  0% { /* start */ }
  50% { /* middle */ }
  100% { /* end */ }
}

/* Responsive */
@media (max-width: 600px) {
  .intervention-container { /* adjust */ }
}
```

**Update App.tsx**:
```typescript
import [InterventionName] from './components/[InterventionName]';

// In renderIntervention():
case '[interventionType]':
  return <[InterventionName] analysis={analysis!} onComplete={handleInterventionComplete} />;
```

---

### 10. Architecture Insights and Design Decisions

#### Why This Routing Matrix Works

The 4-tier routing system is elegant because:

1. **Tier 0 (Mood + Context)** handles the lowest-energy states first
   - Mood ≤ 2 indicates significant distress
   - Context ('before'/'after') shapes the intervention appropriately
   - These users need specific types of support (processing vs preparation)

2. **Tier 1 (Energy Extremes)** overrides everything else
   - Physiological states (extreme energy) take precedence
   - Weight location + energy determine intervention:
     - Low energy + body → breathing (somatic regulation)
     - Low energy + head → grounding (mental clarity)
     - High energy + body → movement (discharge)
     - High energy + head → reframe (channel thinking)

3. **Tier 2 (Moderate Energy)** provides weight-location-driven selection
   - Breathing is the default for body tension (most accessible)
   - Reframe for rumination-driven head states
   - Grounding for general head tension

4. **Tier 3 (Fallback)** ensures no user falls through
   - Breathing is universally accessible, always available

#### Why Breathing is the Workhorse Intervention

- Appears as primary in 6+ routing paths
- Appears as alternative for most interventions
- Never called out as "fallback" in routing code
- Universal accessibility (can do anywhere, anytime, no equipment)
- Physiologically evidence-based (vagal activation through pacing)
- Clear success metrics (user completes 3 cycles)

#### Why Color Differentiation Matters

Two distinct accent colors allow users to cognitively distinguish interventions:
- **Green (breathing, grounding)**: Calming, parasympathetic, nature-based
- **Warm tan (reframe, journaling)**: Thoughtful, reflective, introspective

Users develop mental models: "When I see green, I'm regulating my body. When I see warm, I'm working with my mind."

#### Why Multi-State Components Reduce Complexity

Instead of separate components for each state, each intervention is:
- A single component managing state internally
- Consistent entry point (`onComplete` callback)
- Consistent completion pattern (checkmark + summary)
- Easier to test and maintain

---

## Open Questions

1. **Intervention efficacy tracking**: Should the system measure completion rates vs abandonment?
2. **User customization**: Should breathing cycle count be user-configurable?
3. **Voiceover guidance**: Should movement and grounding have optional audio guidance?
4. **Mobile limitations**: Should movement be hidden on mobile or flagged with warning?
5. **Intervention sequencing**: If user completes multiple check-ins, should we vary interventions or repeat favorites?
6. **Performance metrics**: Should PrescriptionCard track how user felt post-intervention?

---

## Related Research

- [UX Patterns in Therapeutic Interfaces](related-research-if-exists.md)
- [Design System Documentation](../../design-tokens.md)
- [Routing Logic Deep Dive](intervention-routing-analysis.md)

---

## Architecture Recommendations Summary

| Component | Status | Effort | Impact | Priority |
|---|---|---|---|---|
| Grounding Exercise | Not implemented | Medium | High | 1 |
| Add fallback messaging | Design improvement | Low | Medium | 2 |
| Journaling Prompt | Not implemented | Medium | Medium-High | 3 |
| Movement Reset | Not implemented | Medium-High | Medium | 4 |
| Mental Rehearsal | Not implemented | Medium | Low-Medium | 5 |
| Breathing enhancements | Design improvement | Low-Medium | Low | Optional |
| Reframe enhancements | Design improvement | Low-Medium | Low | Optional |

