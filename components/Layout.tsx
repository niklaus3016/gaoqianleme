
import React, { useState } from 'react';
import { Browser } from '@capacitor/browser';
import { AppRoute, ThemeMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: AppRoute;
  setActiveRoute: (route: AppRoute) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeRoute, setActiveRoute, theme, toggleTheme, onLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleDeleteAccountClick = () => {
    setShowSettings(false);
    setShowDeleteAccountConfirm(true);
  };

  const handleDeleteAccountConfirm = async () => {
    setShowDeleteAccountConfirm(false);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://lisqtboywrjw.sealoshzh.site/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userId');
        if (onLogout) {
          onLogout();
        }
        alert('账号已成功注销');
      } else {
        alert(data.message || '注销账号失败，请稍后重试');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('注销账号失败，请检查网络连接');
    }
  };

  const handleDeleteAccountCancel = () => {
    setShowDeleteAccountConfirm(false);
  };

  const navItems = [
    { id: AppRoute.GOAL, label: '目标', icon: '🎯' },
    { id: AppRoute.ACCOUNTING, label: '记账', icon: '💰' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-inherit">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b px-6 py-4 flex justify-between items-center transition-colors">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">📝</div>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-pink-400 to-red-500">荔枝记账</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xl"
          >
            ⚙️
          </button>
          {onLogout && (
            <button 
              onClick={handleLogoutClick}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xl"
            >
              📴
            </button>
          )}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xl"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-lg mx-auto w-full pb-24">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t px-2 py-3 flex justify-around items-center z-50 transition-colors">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveRoute(item.id)}
            className={`flex flex-col items-center transition-all duration-300 ${
              activeRoute === item.id 
                ? 'text-wealth scale-110' 
                : 'text-gray-400 opacity-60'
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-bold">{item.label}</span>
          </button>
        ))}
      </nav>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">📴</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                确认退出登录？
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                退出后需要重新登录才能使用
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleLogoutCancel}
                className="flex-1 py-3.5 rounded-2xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                设置
              </h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={async () => {
                  try {
                    await Browser.open({ 
                      url: 'https://www.gnyq.cn/privacy-policy.html',
                      toolbarColor: '#10b981'
                    });
                  } catch (error) {
                    console.error('Failed to open browser:', error);
                    alert('无法打开隐私政策，请稍后重试');
                  }
                }}
                className="w-full py-4 rounded-2xl font-bold text-wealth bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                隐私政策
              </button>
              <button
                onClick={handleDeleteAccountClick}
                className="w-full py-4 rounded-2xl font-bold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                注销账号
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-4 rounded-2xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccountConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                确认注销账号？
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                注销后，您的账号和所有数据将被永久删除，无法恢复
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccountCancel}
                className="flex-1 py-3.5 rounded-2xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteAccountConfirm}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                确认注销
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
