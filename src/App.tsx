import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Layout } from './components/Layout';
import { ServiceView } from './components/ServiceView';
import { AIAssistant } from './components/AIAssistant';

import { SettingsModal, type UserSettings } from './components/SettingsModal';

const services = [
  { id: 'slack', url: 'https://app.slack.com/client', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' },
  { id: 'discord', url: 'https://discord.com/app', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' },
  { id: 'telegram', url: 'https://web.telegram.org/k/', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' },
];

const DEFAULT_SETTINGS: UserSettings = {
  userName: '',
  openaiKey: '',
  geminiKey: ''
};

function App() {
  const [activeService, setActiveService] = React.useState('slack');
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [userSettings, setUserSettings] = React.useState<UserSettings>(() => {
    const saved = localStorage.getItem('omnichat_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const handleSaveSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    localStorage.setItem('omnichat_settings', JSON.stringify(newSettings));
    // Sync key to main process for context menu
    window.ipcRenderer.setGeminiKey(newSettings.geminiKey);
  };

  // Initial sync
  React.useEffect(() => {
    if (userSettings.geminiKey) {
      window.ipcRenderer.setGeminiKey(userSettings.geminiKey);
    }
  }, []);

  const [unreadCounts, setUnreadCounts] = React.useState<Record<string, number>>({});

  const handleUnreadUpdate = (id: string, count: number) => {
    setUnreadCounts(prev => {
      if (prev[id] === count) return prev;
      return { ...prev, [id]: count };
    });
  };

  return (
    <Layout
      sidebar={
        <Sidebar
          activeService={activeService}
          onServiceChange={setActiveService}
          onOpenSettings={() => setIsSettingsOpen(true)}
          unreadCounts={unreadCounts}
        />
      }
    >
      {activeService === 'ai' ? (
        <AIAssistant userName={userSettings.userName} apiKey={userSettings.geminiKey} />
      ) : (
        services.map((service) => (
          <ServiceView
            key={service.id}
            id={service.id}
            url={service.url}
            isActive={activeService === service.id}
            userAgent={service.userAgent}
            onUnreadUpdate={handleUnreadUpdate}
          />
        ))
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialSettings={userSettings}
      />
    </Layout>
  );
}

export default App;
