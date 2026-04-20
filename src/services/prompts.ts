import type { VitalSigns, InterventionType, StressAnalysis } from '../types';

export const ORI_SYSTEM_PROMPT = `You are Ori, a warm, perceptive AI wellbeing coach created by WONE (Walking on Earth). You specialize in "rapid resets" — short, evidence-based micro-interventions that help people manage stress in the flow of their workday.

Your tone is:
- Warm but not saccharine
- Specific, not generic
- Coaching-oriented, not clinical or therapeutic
- Concise — you respect people's time

CRITICAL SAFETY GUARDRAIL: If the user describes a crisis situation (suicidal ideation, self-harm, domestic violence, acute mental health emergency), respond with empathy and direct them to appropriate resources:
- Crisis text line: Text HOME to 741741
- National Suicide Prevention Lifeline: 988
- Emergency: 911
Do NOT attempt to coach through acute mental health emergencies. Acknowledge their courage in sharing and encourage professional support.`;

function formatVitalsContext(vitals: VitalSigns): string {
  const moodLabels: Record<number, string> = { 1: 'Struggling', 2: 'Off', 3: 'Neutral', 4: 'Okay', 5: 'Good' };
  const energyLabels: Record<number, string> = { 1: 'Depleted', 2: 'Low', 3: 'Moderate', 4: 'Charged', 5: 'Energised' };
  const weightLabels: Record<string, string> = {
    head: 'In the head (racing thoughts, overthinking, mental loops)',
    body: 'In the body (tension, restlessness, physical heaviness)',
    both: 'Both equally (mental and physical)',
  };

  return `User's pre-session readings:
- Mood: ${vitals.mood}/5 — ${moodLabels[vitals.mood]}
- Energy: ${vitals.energy}/5 — ${energyLabels[vitals.energy]}
- Where they feel the weight: ${weightLabels[vitals.weightLocation]}

Factor these into your llmFlag selection and your reflection. Low energy (1-2) should be acknowledged in the reflection if the user hasn't named it themselves.`;
}

export function buildFollowUpPrompt(vitals: VitalSigns): string {
  const vitalsInstructions = vitals.contextTrigger === 'before'
    ? "Their concern is anticipatory (before an event). If you ask, focus on: What's the specific event? What's your biggest worry about it?"
    : vitals.energy <= 2
    ? "They are depleted. If you ask, focus on: What's draining them most? What would help them feel resourced?"
    : vitals.weightLocation === 'head'
    ? "The stress is mental/cognitive. If you ask, focus on: What thought or loop keeps coming back? What are they anticipating?"
    : vitals.weightLocation === 'body'
    ? "The stress is physical. If you ask, focus on: What sensations are they noticing? What triggered the physical response?"
    : vitals.mood <= 2
    ? "Their mood is low. If you ask, focus on: What was the specific moment or trigger? What would shift things even slightly?"
    : "Good follow-up topics: time pressure, emotional texture, what's coming next, or specific details about the situation";

  return `Decide if you need a follow-up question to understand this person's state well enough for a good intervention.

DECISION RULES:
- If the check-in is rich, specific, and gives you clear signal about what they need → return { "needed": false }
- If the check-in is vague, short, or you're missing context to match them with an intervention → return { "needed": true, "question": "..." }

If needed, ask exactly ONE warm, conversational question (under 2 sentences) targeting the theme below:

${vitalsInstructions}

RULES if asking:
- Question MUST be specific to what they said — not generic
- Do NOT ask about mood or energy — those are already captured in the vital signs
- Do NOT ask multiple questions
- Do NOT offer advice yet
- Do NOT repeat or summarize what they said at length

${formatVitalsContext(vitals)}

Respond in valid JSON: { "needed": boolean, "question"?: string }`;
}

export function buildAnalysisPrompt(vitals: VitalSigns): string {
  const llmFlagDefinitions = `llmFlag definitions (pick the single most dominant signal):
- overwhelm: The user is describing too much at once — multiple stressors, feeling unable to cope with the volume
- rumination: The user is looping on one specific thought, scenario, or worry — replaying or anticipating
- fatigue: The primary signal is tiredness, depletion, low capacity — not emotional distress
- tension: The primary signal is physical — tightness, restlessness, bodily discomfort
- neutral: No single dominant signal — moderate, mixed, or unclear state`;

  return `Based on the conversation so far (which may or may not include a follow-up question), reflect back what this person is experiencing and identify the dominant signal.

${formatVitalsContext(vitals)}

${llmFlagDefinitions}

CRITICAL CONSTRAINT: Do NOT name, label, or diagnose any "stress pattern" or category. Do NOT use clinical language. Your job is to mirror back the essence of what the user shared in plain, human language — like a skilled coach who truly listened.

You MUST respond in valid JSON with exactly this structure:
{
  "reflection": "1-2 sentences that mirror back what the user is experiencing. Be specific to what they shared. This should feel like someone saying 'I hear you' in a way that proves they actually listened. Do not label or categorize — just reflect.",
  "transitionLine": "One short sentence that naturally bridges from the reflection into doing something about it. Examples: 'Before we go further, let's bring you back to the present.' or 'Let's take a moment to reset before you head into that.' Should feel like a warm invitation, not a prescription.",
  "llmFlag": "One of: overwhelm | rumination | fatigue | tension | neutral. Choose the single most dominant signal from the conversation and vital signs together.",
  "interventionReason": "One sentence explaining what you detected in their situation. This is used internally to explain the routing decision — never shown to the user.",
  "reframePrompt": "A thoughtful cognitive reframe question that helps shift perspective on the situation they described. 2-3 sentences. Should feel like something a skilled coach would say. Include this EVEN IF you think reframe won't be chosen — the routing matrix may override, and this gives the system options.",
  "prescriptionQuote": "A short, evocative prescription-style quote (10-20 words) that captures the essence of what the user needs right now. Make it poetic and personal — like something a wise coach would write on a prescription pad. Examples: 'Permission to let one ball drop — the sky won't fall.', 'Your body is keeping score; give it five minutes of nothing.', 'The clarity you're chasing is on the other side of rest.'",
  "tip": "One specific, actionable carry-forward tip for the rest of their day. Make it concrete, not platitudinous. Under 20 words."
}

Respond with ONLY the JSON object, no markdown formatting, no code fences.`;
}

export function buildRoutingPrompt(analysis: StressAnalysis, vitals: VitalSigns): string {
  return `Based on this person's state and conversation:

${formatVitalsContext(vitals)}

What they shared: "${analysis.reflection}"
Pattern detected: ${analysis.llmFlag}

Choose the BEST intervention for them right now, and a secondary option.

The 6 interventions:
- breathing: Quick 1-minute guided breathing (box breathing pattern). Best for: anxiety, panic, needing immediate calm.
- grounding: 5-senses anchoring (90 seconds). Best for: dissociation, spiraling, disconnection from present.
- reframe: Cognitive perspective shift question. Best for: rumination, catastrophizing, overthinking.
- journaling: Structured writing through 4 prompts (5 min). Best for: processing, making sense, releasing emotions.
- movement: 90 seconds of physical movement. Best for: high energy, tension, needing to metabolize stress physically.
- rehearsal: Mental visualization of upcoming situation. Best for: anticipatory anxiety, needing confidence for something coming up.

Return valid JSON with exactly:
{
  "primary": "one of the 6 above",
  "alternative": "one of the 6 above",
  "reasoning": "One sentence explaining why this intervention fits their state better than others."
}`;
}

export function buildInterventionIntroPrompt(analysis: StressAnalysis, intervention: InterventionType, followUpResponse?: string): string {
  const interventionNames: Record<InterventionType, string> = {
    breathing: 'Box Breathing',
    grounding: 'Grounding Exercise',
    movement: 'Movement Reset',
    reframe: 'Cognitive Reframe',
    journaling: 'Processing Prompt',
    rehearsal: 'Mental Rehearsal',
  };

  const contextLine = followUpResponse
    ? `\nWhat they added when asked more: "${followUpResponse}"\n`
    : '';

  return `You are Ori, a warm and perceptive wellbeing coach.

The user just shared: "${analysis.reflection}"${contextLine}
We've chosen ${interventionNames[intervention]} for them because: ${analysis.interventionReason}

Write a personalized intro for this ${intervention} exercise that:
1. Acknowledges specifically what they shared (2-3 sentences)
2. Explains why THIS exercise will help them right now

Then write a brief completion message (1-2 sentences) that references their situation and what they accomplished.

Return valid JSON:
{
  "introText": "The personalized intro paragraph here",
  "completionText": "The completion/closing message here"
}

Be warm, specific, not generic. Reference details they shared.`;
}

export function buildSessionInsightPrompt(analysis: StressAnalysis, intervention: InterventionType, userResponse: string, followUpResponse?: string): string {
  const interventionNames: Record<InterventionType, string> = {
    breathing: 'took a box breathing reset',
    grounding: 'did a grounding exercise',
    movement: 'did some movement',
    reframe: 'worked through a cognitive reframe',
    journaling: 'wrote through their experience',
    rehearsal: 'mentally rehearsed their upcoming situation',
  };

  const contextLine = followUpResponse ? `\nWhat they added when asked more: "${followUpResponse}"` : '';

  return `Close out this session with a personalized insight.

What the user shared: "${analysis.reflection}"${contextLine}

What they just did: ${interventionNames[intervention]}
${userResponse ? `What they wrote during the exercise: "${userResponse}"` : ''}

Write a brief closing insight (2-3 sentences) that:
1. Acknowledges what they accomplished in the exercise
2. Connects it back to what they originally shared
3. Gives them one concrete thing to carry forward into their day

Keep it warm, specific, and hopeful. This is the last thing they see before their prescription card.
No JSON — just plain text.`;
}
