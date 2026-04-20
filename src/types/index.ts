export type Step =
  | 'welcome'
  | 'vitals'
  | 'checkin'
  | 'followup'
  | 'reflection'
  | 'intervention'
  | 'card';

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
