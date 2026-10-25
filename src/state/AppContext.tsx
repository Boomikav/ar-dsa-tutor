import React, { createContext, useContext, useState, useEffect } from 'react';
import { DSATopic } from '../models/topic';
import { LearnerState } from '../models/learner';
import { INITIAL_DSA_TOPICS } from '../data/topicsData';
import { services, ServiceContainer } from '../services';

export type ScreenId =
  | 'splash'
  | 'onboarding'
  | 'diagnostic'
  | 'home'
  | 'topics'
  | 'topic-details'
  | 'learning-session'
  | 'ar-session'
  | 'ai-tutor'
  | 'assessment'
  | 'progress'
  | 'recommendations'
  | 'profile'
  | 'settings'
  | 'research-dashboard';

import { CurrentOperationState, TutorHelpLevel } from '../models/ai';
import { MisconceptionDiagnosis } from '../models/misconception';

export type BottomNavTab = 'home' | 'topics' | 'ai-tutor' | 'progress' | 'profile';

export interface TutorSessionContext {
  topic: DSATopic;
  operation?: Partial<CurrentOperationState>;
  misconception?: MisconceptionDiagnosis | null;
  helpLevel?: TutorHelpLevel;
  initialQuery?: string;
}

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
}

interface AppContextType {
  currentScreen: ScreenId;
  previousScreen?: ScreenId;
  activeTab: BottomNavTab;
  selectedTopic: DSATopic;
  learnerState: LearnerState;
  topics: DSATopic[];
  services: ServiceContainer;
  isDeviceChassisEnabled: boolean;
  hasCompletedOnboarding: boolean;
  hasCompletedDiagnostic: boolean;
  accessibilitySettings: AccessibilitySettings;
  activeTutorContext?: TutorSessionContext | null;
  navigateTo: (screen: ScreenId, topic?: DSATopic) => void;
  navigateToTutor: (ctx: TutorSessionContext) => void;
  setActiveTab: (tab: BottomNavTab) => void;
  setSelectedTopic: (topic: DSATopic) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setHasCompletedDiagnostic: (completed: boolean) => void;
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  refreshLearnerState: () => Promise<void>;
  toggleDeviceChassis: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home'); // Default to home for easy direct inspection, splash can be triggered anytime
  const [previousScreen, setPreviousScreen] = useState<ScreenId | undefined>();
  const [activeTab, setActiveTabState] = useState<BottomNavTab>('home');
  const [selectedTopic, setSelectedTopic] = useState<DSATopic>(() => 
    INITIAL_DSA_TOPICS.find(t => t.id === 'ds-binary-search-tree') || INITIAL_DSA_TOPICS[5]
  );
  const [learnerState, setLearnerState] = useState<LearnerState>(() => {
    return {
      profile: {
        id: 'student-usr-4092',
        fullName: 'Alex Chen',
        username: 'achen_cs',
        avatarUrl: '',
        academicLevel: 'Undergraduate',
        preferredLearningPace: 'visual-first',
        enrolledAt: '2026-08-15T08:00:00.000Z',
        arPreferences: {
          enablePlaneOverlay: true,
          autoRotate3D: false,
          spatialAudio: true,
          renderQuality: 'high'
        },
        aiPreferences: {
          tutoringStyle: 'socratic',
          verbosity: 'concise'
        }
      },
      history: {
        totalStudyMinutes: 240,
        totalSessions: 14,
        completedTopicIds: ['ds-array', 'algo-linear-search', 'ds-stack'],
        inProgressTopicIds: ['ds-linked-list', 'ds-binary-tree', 'algo-binary-search'],
        recentTopicId: 'ds-linked-list',
        lastActiveTimestamp: new Date().toISOString(),
        assessmentHistory: [],
        dailyStreak: 6
      },
      masteryMap: {},
      currentGoalTopicId: 'ds-linked-list'
    };
  });
  const [isDeviceChassisEnabled, setIsDeviceChassisEnabled] = useState(true);
  const [activeTutorContext, setActiveTutorContext] = useState<TutorSessionContext | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ar_dsa_onboarding_completed') === 'true';
    } catch {
      return false;
    }
  });
  const [hasCompletedDiagnostic, setHasCompletedDiagnosticState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ar_dsa_diagnostic_completed') === 'true';
    } catch {
      return false;
    }
  });
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('ar_dsa_accessibility');
      return saved ? JSON.parse(saved) : { reducedMotion: false, highContrast: false };
    } catch {
      return { reducedMotion: false, highContrast: false };
    }
  });

  const setHasCompletedOnboarding = (completed: boolean) => {
    setHasCompletedOnboardingState(completed);
    try {
      localStorage.setItem('ar_dsa_onboarding_completed', completed ? 'true' : 'false');
    } catch {
      // safe fallback
    }
  };

  const setHasCompletedDiagnostic = (completed: boolean) => {
    setHasCompletedDiagnosticState(completed);
    try {
      localStorage.setItem('ar_dsa_diagnostic_completed', completed ? 'true' : 'false');
    } catch {
      // safe fallback
    }
  };

  const updateAccessibilitySettings = (settings: Partial<AccessibilitySettings>) => {
    setAccessibilitySettings(prev => {
      const updated = { ...prev, ...settings };
      try {
        localStorage.setItem('ar_dsa_accessibility', JSON.stringify(updated));
      } catch {
        // safe fallback
      }
      return updated;
    });
  };

  // Sync accessibility classes with document body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('reduced-motion', accessibilitySettings.reducedMotion);
      document.body.classList.toggle('high-contrast', accessibilitySettings.highContrast);
    }
  }, [accessibilitySettings]);

  // Initial load from persistent service
  useEffect(() => {
    services.learnerService.getLearnerState().then(state => {
      setLearnerState(state);
    });
  }, []);

  const refreshLearnerState = async () => {
    const updated = await services.learnerService.getLearnerState();
    setLearnerState(updated);
  };

  const navigateTo = (screen: ScreenId, topic?: DSATopic) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    if (topic) {
      setSelectedTopic(topic);
    }
    if (screen !== 'ai-tutor') {
      setActiveTutorContext(null);
    }

    // Sync bottom navigation tabs if navigating to a primary tab screen
    if (screen === 'home') setActiveTabState('home');
    else if (screen === 'topics') setActiveTabState('topics');
    else if (screen === 'ai-tutor') setActiveTabState('ai-tutor');
    else if (screen === 'progress') setActiveTabState('progress');
    else if (screen === 'profile') setActiveTabState('profile');

    // Telemetry trace
    services.analyticsService.trackEvent({
      userId: learnerState.profile.id,
      topicId: topic ? topic.id : selectedTopic.id,
      eventType: 'screen_view',
      payload: { screen, previous: currentScreen }
    });
  };

  const navigateToTutor = (ctx: TutorSessionContext) => {
    setActiveTutorContext(ctx);
    navigateTo('ai-tutor', ctx.topic);
  };

  const setActiveTab = (tab: BottomNavTab) => {
    setActiveTabState(tab);
    navigateTo(tab as ScreenId);
  };

  const toggleDeviceChassis = () => {
    setIsDeviceChassisEnabled(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        previousScreen,
        activeTab,
        selectedTopic,
        learnerState,
        topics: INITIAL_DSA_TOPICS,
        services,
        isDeviceChassisEnabled,
        hasCompletedOnboarding,
        hasCompletedDiagnostic,
        accessibilitySettings,
        activeTutorContext,
        navigateTo,
        navigateToTutor,
        setActiveTab,
        setSelectedTopic,
        setHasCompletedOnboarding,
        setHasCompletedDiagnostic,
        updateAccessibilitySettings,
        refreshLearnerState,
        toggleDeviceChassis
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
