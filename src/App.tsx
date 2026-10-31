import React from 'react';
import { AppProvider, useApp } from './state/AppContext';
import { MobileFrame } from './components/MobileFrame';
import { BottomNavigation } from './components/BottomNavigation';

// 14 Screen Imports
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DiagnosticScreen } from './screens/DiagnosticScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TopicExplorerScreen } from './screens/TopicExplorerScreen';
import { TopicDetailsScreen } from './screens/TopicDetailsScreen';
import { LearningSessionScreen } from './screens/LearningSessionScreen';
import { ARSessionScreen } from './screens/ARSessionScreen';
import { AITutorScreen } from './screens/AITutorScreen';
import { AssessmentScreen } from './screens/AssessmentScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { RecommendationsScreen } from './screens/RecommendationsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ResearchDashboardScreen } from './screens/ResearchDashboardScreen';
import { RAGEvaluationScreen } from './screens/RAGEvaluationScreen';

const MainScreenRouter: React.FC = () => {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'diagnostic':
        return <DiagnosticScreen />;
      case 'home':
        return <HomeScreen />;
      case 'topics':
        return <TopicExplorerScreen />;
      case 'topic-details':
        return <TopicDetailsScreen />;
      case 'learning-session':
        return <LearningSessionScreen />;
      case 'ar-session':
        return <ARSessionScreen />;
      case 'ai-tutor':
        return <AITutorScreen />;
      case 'assessment':
        return <AssessmentScreen />;
      case 'progress':
        return <ProgressScreen />;
      case 'recommendations':
        return <RecommendationsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'research-dashboard':
        return <ResearchDashboardScreen />;
      case 'rag-evaluation':
        return <RAGEvaluationScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Screens that hide the bottom navigation dock
  const hideBottomNav = ['splash', 'onboarding', 'diagnostic', 'ar-session', 'assessment'].includes(currentScreen);

  return (
    <>
      {renderScreen()}
      {!hideBottomNav && <BottomNavigation />}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MobileFrame>
        <MainScreenRouter />
      </MobileFrame>
    </AppProvider>
  );
}
