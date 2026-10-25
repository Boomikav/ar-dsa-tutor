import React from 'react';
import { useApp, BottomNavTab } from '../state/AppContext';
import { Home, Compass, MessageSquareCode, TrendingUp, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs: { id: BottomNavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'topics', label: 'Topics', icon: <Compass size={20} /> },
    { id: 'ai-tutor', label: 'AI Tutor', icon: <MessageSquareCode size={20} /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];

  return (
    <nav className="bottom-nav-container" aria-label="Main Navigation">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`nav-tab-item ${isActive ? 'active' : ''}`}
            aria-selected={isActive}
            role="tab"
          >
            {tab.icon}
            <span className="nav-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
