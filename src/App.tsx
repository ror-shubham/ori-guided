import { useState, useCallback, lazy, Suspense } from 'react';
import type { Step, StressAnalysis, VitalSigns, RoutingResult, InterventionType, InterventionContent } from './types';
import { assessFollowUp, getStressAnalysis, routeInterventionWithLLM, generateInterventionIntro, generateSessionInsight, saveSession } from './services/llm';
import HistoryScreen from './components/HistoryScreen';
import { isAuthenticated, logout } from './services/auth';
import ProgressBar from './components/ProgressBar';
import TypingIndicator from './components/TypingIndicator';
import WelcomeScreen from './components/WelcomeScreen';
import VitalSignsStep from './components/VitalSignsStep';
import CheckInStep from './components/CheckInStep';
import FollowUpStep from './components/FollowUpStep';
import ReflectionStep from './components/ReflectionStep';
import PrescriptionCard from './components/PrescriptionCard';
import AuthScreen from './components/AuthScreen';
import './App.css';

const BreathingExercise = lazy(() => import('./components/BreathingExercise'));
const GroundingExercise = lazy(() => import('./components/GroundingExercise'));
const CognitiveReframe = lazy(() => import('./components/CognitiveReframe'));
const JournalingPrompt = lazy(() => import('./components/JournalingPrompt'));
const MovementReset = lazy(() => import('./components/MovementReset'));
const MentalRehearse = lazy(() => import('./components/MentalRehearse'));

function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [step, setStep] = useState<Step>('welcome');

  const [vitals, setVitals] = useState<VitalSigns | null>(null);
  const [checkinResponse, setCheckinResponse] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpResponse, setFollowUpResponse] = useState('');
  const [analysis, setAnalysis] = useState<StressAnalysis | null>(null);
  const [routingResult, setRoutingResult] = useState<RoutingResult | null>(null);
  const [chosenIntervention, setChosenIntervention] = useState<InterventionType | null>(null);
  const [interventionContent, setInterventionContent] = useState<InterventionContent | null>(null);
  const [sessionInsight, setSessionInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBegin = () => {
    setStep('vitals');
  };

  const handleVitalsSubmit = (v: VitalSigns) => {
    setVitals(v);
    setStep('checkin');
  };

  const handleCheckinSubmit = useCallback(async (response: string) => {
    setCheckinResponse(response);
    setIsLoading(true);
    setError(null);

    try {
      const followUpAssessment = await assessFollowUp(response, vitals!);

      if (followUpAssessment.needed && followUpAssessment.question) {
        // Follow-up is needed, show the follow-up step
        setFollowUpQuestion(followUpAssessment.question);
        setStep('followup');
      } else {
        // Follow-up is not needed, proceed directly to analysis
        const analysisResult = await getStressAnalysis(response, vitals!);
        setAnalysis(analysisResult);

        const routing = await routeInterventionWithLLM(analysisResult, vitals!);
        setRoutingResult(routing);
        setChosenIntervention(routing.primary);

        setStep('reflection');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [vitals]);

  const handleFollowUpSubmit = useCallback(async (response: string) => {
    setFollowUpResponse(response);
    setIsLoading(true);
    setError(null);

    try {
      const analysisResult = await getStressAnalysis(checkinResponse, vitals!, followUpQuestion, response);
      setAnalysis(analysisResult);

      // Call LLM-driven routing
      const routing = await routeInterventionWithLLM(analysisResult, vitals!);
      setRoutingResult(routing);
      setChosenIntervention(routing.primary);

      setStep('reflection');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [checkinResponse, followUpQuestion, vitals]);

  const handleInterventionChoice = (intervention: InterventionType) => {
    setChosenIntervention(intervention);
  };

  const handleStartIntervention = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate personalized intervention intro
      const content = await generateInterventionIntro(analysis!, chosenIntervention!, followUpResponse || undefined);
      setInterventionContent(content ?? null);
      setStep('intervention');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [analysis, chosenIntervention, followUpResponse]);

  const handleInterventionComplete = useCallback(async (userResponse?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const insight = await generateSessionInsight(analysis!, chosenIntervention!, userResponse ?? '', followUpResponse || undefined);
      setSessionInsight(insight);
      setStep('card');

      saveSession({
        mood: vitals!.mood,
        energy: vitals!.energy,
        weightLocation: vitals!.weightLocation,
        contextTrigger: vitals!.contextTrigger,
        checkinResponse,
        followUpQuestion: followUpQuestion || undefined,
        followUpResponse: followUpResponse || undefined,
        llmFlag: analysis!.llmFlag,
        reflection: analysis!.reflection,
        interventionType: chosenIntervention!,
        sessionInsight: insight || undefined,
        prescriptionQuote: analysis!.prescriptionQuote || undefined,
        tip: analysis!.tip || undefined,
      }).catch(() => {/* fire-and-forget */});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [analysis, checkinResponse, chosenIntervention, followUpQuestion, followUpResponse, vitals]);

  const handleRestart = () => {
    setStep('welcome');
    setVitals(null);
    setCheckinResponse('');
    setFollowUpQuestion('');
    setFollowUpResponse('');
    setAnalysis(null);
    setRoutingResult(null);
    setChosenIntervention(null);
    setInterventionContent(null);
    setSessionInsight(null);
    setError(null);
    setIsLoading(false);
  };

  const handleLogout = useCallback(async () => {
    await logout();
    setAuthed(false);
    handleRestart();
  }, []);

  const renderStep = () => {
    if (isLoading) {
      return (
        <div className="step-container loading-container slide-up">
          <TypingIndicator />
        </div>
      );
    }

    if (error) {
      return (
        <div className="step-container error-container slide-up">
          <div className="error-card card">
            <h3 className="heading-section">Something went wrong</h3>
            <p className="body-text">{error}</p>
            <div className="error-actions">
              <button className="btn-secondary" onClick={handleRestart}>
                Start Over
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setError(null);
                  // If we don't have analysis yet, determine where to go back
                  if (!analysis) {
                    // If followUpQuestion exists, error was in follow-up step
                    if (followUpQuestion) {
                      setStep('followup');
                    } else {
                      // Otherwise, error was in check-in step (or follow-up wasn't needed)
                      setStep('checkin');
                    }
                  }
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (step) {
      case 'history':
        return <HistoryScreen onClose={() => setStep('welcome')} />;

      case 'welcome':
        return <WelcomeScreen onBegin={handleBegin} onOpenHistory={() => setStep('history')} />;

      case 'vitals':
        return <VitalSignsStep onSubmit={handleVitalsSubmit} />;

      case 'checkin':
        return <CheckInStep onSubmit={handleCheckinSubmit} />;

      case 'followup':
        return (
          <FollowUpStep
            question={followUpQuestion}
            userCheckin={checkinResponse}
            onSubmit={handleFollowUpSubmit}
          />
        );

      case 'reflection':
        return analysis && routingResult ? (
          <ReflectionStep
            analysis={analysis}
            routingResult={routingResult}
            chosenIntervention={chosenIntervention}
            onInterventionChoice={handleInterventionChoice}
            onContinue={handleStartIntervention}
          />
        ) : null;

      case 'intervention':
        return chosenIntervention ? (
          <Suspense fallback={<div className="step-container loading-container slide-up"><TypingIndicator /></div>}>
            {renderIntervention(chosenIntervention)}
          </Suspense>
        ) : null;

      case 'card':
        return analysis && chosenIntervention ? (
          <PrescriptionCard
            analysis={analysis}
            chosenIntervention={chosenIntervention}
            vitals={vitals}
            sessionInsight={sessionInsight ?? undefined}
            onRestart={handleRestart}
          />
        ) : null;

      default:
        return null;
    }
  };

  const renderIntervention = (intervention: InterventionType) => {
    switch (intervention) {
      case 'breathing':
        return <BreathingExercise content={interventionContent ?? undefined} onComplete={() => void handleInterventionComplete()} />;
      case 'grounding':
        return <GroundingExercise content={interventionContent ?? undefined} onComplete={() => void handleInterventionComplete()} />;
      case 'reframe':
        return <CognitiveReframe analysis={analysis!} onComplete={(reflection?: string) => void handleInterventionComplete(reflection)} />;
      case 'journaling':
        return <JournalingPrompt onComplete={(summary?: string) => void handleInterventionComplete(summary)} />;
      case 'movement':
        return <MovementReset content={interventionContent ?? undefined} onComplete={() => void handleInterventionComplete()} />;
      case 'rehearsal':
        return <MentalRehearse onComplete={(situation?: string) => void handleInterventionComplete(situation)} />;
      default:
        return <BreathingExercise content={interventionContent ?? undefined} onComplete={() => void handleInterventionComplete()} />;
    }
  };

  if (!authed) {
    return (
      <>
        <div className="ambient-glow" />
        <AuthScreen onAuth={() => setAuthed(true)} />
      </>
    );
  }

  return (
    <>
      <div className="ambient-glow" />
      {step === 'welcome' && (
        <button
          className="btn-secondary app-logout"
          onClick={() => void handleLogout()}
          type="button"
        >
          Sign out
        </button>
      )}
      <div className="app-wrapper">
        <ProgressBar currentStep={step} />
        <main className="app-main" key={step}>
          {renderStep()}
        </main>
      </div>
    </>
  );
}

export default App;
