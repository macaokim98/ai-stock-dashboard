import { Moon, Sun, TrendingUp, BarChart3, Star, Brain, Settings, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useStockStore } from '../../store/stockStore';
import { UserSettings } from '../Settings/UserSettings';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

export const Header = () => {
  const { darkMode, toggleDarkMode, activeTab, setActiveTab } = useStockStore();
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { manualRefresh } = useAutoRefresh();

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    manualRefresh();
    setTimeout(() => setIsRefreshing(false), 1000); // Show spinner for 1 second
  };

  const tabs = [
    { id: 'dashboard' as const, label: '대시보드', icon: BarChart3 },
    { id: 'watchlist' as const, label: '관심종목', icon: Star },
    { id: 'portfolio' as const, label: '포트폴리오', icon: TrendingUp },
    { id: 'analysis' as const, label: 'AI 분석', icon: Brain },
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <TrendingUp size={32} />
            Stock Dashboard
          </div>
        </div>
        
        <nav className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
        
        <div className="header-right">
          <button 
            className="theme-toggle"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            aria-label="새로고침"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            새로고침
          </button>
          <button 
            className="theme-toggle"
            onClick={() => setShowSettings(true)}
            aria-label="설정"
          >
            <Settings size={20} />
            설정
          </button>
          <button 
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label="테마 전환"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            {darkMode ? ' 라이트' : ' 다크'}
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <UserSettings />
            <button 
              className="modal-close"
              onClick={() => setShowSettings(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </header>
  );
};