
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import GoalModule from './components/GoalModule';
import AccountingModule from './components/AccountingModule';
import EarnModule from './components/EarnModule';
import WelfareModule from './components/WelfareModule';
import { AppRoute, ThemeMode } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [activeRoute, setActiveRoute] = useState<AppRoute>(AppRoute.GOAL);
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleLogin = (id: string) => {
    setUserId(id);
    setIsLoggedIn(true);
    localStorage.setItem('userId', id);
  };

  const handleLogout = () => {
    setUserId('');
    setIsLoggedIn(false);
    localStorage.removeItem('userId');
  };

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setUserId(savedUserId);
      setIsLoggedIn(true);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const renderContent = () => {
    switch (activeRoute) {
      case AppRoute.GOAL: return <GoalModule userId={userId} />;
      case AppRoute.ACCOUNTING: return <AccountingModule userId={userId} />;
      case AppRoute.EARN: return <EarnModule userId={userId} />;
      case AppRoute.WELFARE: return <WelfareModule userId={userId} />;
      default: return <GoalModule userId={userId} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeRoute={activeRoute} 
      setActiveRoute={setActiveRoute}
      theme={theme}
      toggleTheme={toggleTheme}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
