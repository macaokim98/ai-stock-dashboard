import { Settings, Save, RotateCcw } from 'lucide-react';
import { useUserPreferences } from '../../hooks/useLocalStorage';
import { useStockStore } from '../../store/stockStore';

export const UserSettings = () => {
  const [preferences, setPreferences] = useUserPreferences();
  const { darkMode, toggleDarkMode } = useStockStore();

  const handleSave = () => {
    setPreferences({
      ...preferences,
      darkMode,
    });
    alert('설정이 저장되었습니다!');
  };

  const handleReset = () => {
    if (confirm('모든 설정을 초기화하시겠습니까?')) {
      setPreferences({
        darkMode: false,
        refreshInterval: 30000,
        selectedSymbols: ['AAPL', 'GOOGL', 'MSFT'],
        chartTimeframe: '1mo',
        enableNotifications: false,
        autoRefresh: true,
      });
      alert('설정이 초기화되었습니다!');
    }
  };

  const updatePreference = (key: string, value: boolean | number | string | string[]) => {
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  return (
    <div className="user-settings">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">사용자 설정</h3>
          <Settings size={24} className="card-icon" />
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h4>표시 설정</h4>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={toggleDarkMode}
                />
                다크 모드
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h4>데이터 업데이트</h4>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.autoRefresh}
                  onChange={(e) => updatePreference('autoRefresh', e.target.checked)}
                />
                자동 새로고침
              </label>
            </div>
            <div className="setting-item">
              <label>
                새로고침 간격 (초)
                <select
                  value={preferences.refreshInterval / 1000}
                  onChange={(e) => updatePreference('refreshInterval', parseInt(e.target.value) * 1000)}
                >
                  <option value={15}>15초</option>
                  <option value={30}>30초</option>
                  <option value={60}>1분</option>
                  <option value={300}>5분</option>
                </select>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h4>차트 설정</h4>
            <div className="setting-item">
              <label>
                기본 차트 기간
                <select
                  value={preferences.chartTimeframe}
                  onChange={(e) => updatePreference('chartTimeframe', e.target.value)}
                >
                  <option value="1d">1일</option>
                  <option value="5d">5일</option>
                  <option value="1mo">1개월</option>
                  <option value="3mo">3개월</option>
                  <option value="6mo">6개월</option>
                  <option value="1y">1년</option>
                </select>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h4>알림 설정</h4>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.enableNotifications}
                  onChange={(e) => updatePreference('enableNotifications', e.target.checked)}
                />
                브라우저 알림 활성화
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h4>관심 종목 기본 설정</h4>
            <div className="setting-item">
              <label>
                기본 관심 종목 (쉼표로 구분)
                <input
                  type="text"
                  value={preferences.selectedSymbols.join(', ')}
                  onChange={(e) => updatePreference('selectedSymbols', 
                    e.target.value.split(',').map(s => s.trim().toUpperCase())
                  )}
                  placeholder="AAPL, GOOGL, MSFT"
                />
              </label>
            </div>
          </div>

          <div className="settings-actions">
            <button onClick={handleSave} className="save-button">
              <Save size={16} />
              설정 저장
            </button>
            <button onClick={handleReset} className="reset-button">
              <RotateCcw size={16} />
              초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};