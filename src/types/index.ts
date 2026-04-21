export type Step =
  | 'welcome'
  | 'vitals'
  | 'checkin'
  | 'followup'
  | 'reflection'
  | 'intervention'
  | 'card'
  | 'history';

export type InterventionType =
  | 'breathing'
  | 'grounding'
  | 'movement'
  | 'reframe'
  | 'journaling'
  | 'rehearsal';

export type LLMFlag = 'overwhelm' | 'rumination' | 'fatigue' | 'tension' | 'neutral';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type WeightLocation = 'head' | 'body' | 'both';
export type ContextTrigger = 'before' | 'during' | 'after' | 'general';

export interface VitalSigns {
  mood: MoodLevel;
  energy: EnergyLevel;
  weightLocation: WeightLocation;
  contextTrigger: ContextTrigger;
}

export interface SignalProfile {
  mood: MoodLevel;
  energy: EnergyLevel;
  weightLocation: WeightLocation;
  llmFlag: LLMFlag;
}

export interface StressAnalysis {
  reflection: string;
  transitionLine: string;
  llmFlag: LLMFlag;
  interventionReason: string;
  reframePrompt: string;
  prescriptionQuote: string;
  tip: string;
}

export interface InterventionContent {
  introText: string;
  completionText: string;
}

export interface RoutingResult {
  primary: InterventionType;
  alternative: InterventionType;
  reasoning?: string;
}

export interface SessionPayload {
  mood: MoodLevel;
  energy: EnergyLevel;
  weightLocation: WeightLocation;
  contextTrigger: ContextTrigger;
  checkinResponse: string;
  followUpQuestion?: string;
  followUpResponse?: string;
  llmFlag: LLMFlag;
  reflection: string;
  interventionType: InterventionType;
  sessionInsight?: string;
  prescriptionQuote?: string;
  tip?: string;
}

export interface CheckInRecord {
  id: number;
  created_at: string;
  mood: MoodLevel;
  energy: EnergyLevel;
  weight_location: WeightLocation;
  context_trigger: ContextTrigger;
  llm_flag: LLMFlag;
  intervention_type: InterventionType;
  prescription_quote: string | null;
  tip: string | null;
  session_insight: string | null;
  // detail fields (present in full fetch)
  checkin_response?: string;
  follow_up_question?: string | null;
  follow_up_response?: string | null;
  reflection?: string;
}

export interface ConversationState {
  step: Step;
  messages: Message[];
  vitals: VitalSigns | null;
  checkinResponse: string;
  followUpQuestion: string;
  followUpResponse: string;
  analysis: StressAnalysis | null;
  routingResult: RoutingResult | null;
  chosenIntervention: InterventionType | null;
  interventionContent: InterventionContent | null;
  sessionInsight: string | null;
  interventionUserResponse: string | null;
  isLoading: boolean;
  error: string | null;
}
