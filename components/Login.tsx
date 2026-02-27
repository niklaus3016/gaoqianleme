import React, { useState } from 'react';
import { Browser } from '@capacitor/browser';

interface LoginProps {
  onLogin: (userId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginType, setLoginType] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('https://lisqtboywrjw.sealoshzh.site/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      
      if (!response.ok) {
        setError('登录失败，请检查网络连接');
        return;
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        setError('登录失败，服务器返回数据格式错误');
        return;
      }
      
      if (data.code === 200) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.data.userInfo));
        onLogin(data.data.userInfo.userId);
      } else {
        setError(data.message || '登录失败，请重试');
      }
    } catch (err: any) {
      setError('登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少6位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('https://lisqtboywrjw.sealoshzh.site/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      
      if (!response.ok) {
        setError('注册失败，请检查网络连接');
        return;
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        setError('注册失败，服务器返回数据格式错误');
        return;
      }
      
      if (data.code === 200) {
        // 注册成功后自动登录
        try {
          const loginResponse = await fetch('https://lisqtboywrjw.sealoshzh.site/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username.trim(), password })
          });
          
          if (!loginResponse.ok) {
            setError('注册成功但登录失败，请手动登录');
            return;
          }
          
          let loginData;
          try {
            loginData = await loginResponse.json();
          } catch (jsonError) {
            setError('注册成功但登录失败，服务器返回数据格式错误');
            return;
          }
          
          if (loginData.code === 200) {
            localStorage.setItem('token', loginData.data.token);
            localStorage.setItem('userInfo', JSON.stringify(loginData.data.userInfo));
            onLogin(loginData.data.userInfo.userId);
          } else {
            setError('注册成功但登录失败，请手动登录');
          }
        } catch (loginError) {
          setError('注册成功但登录失败，请手动登录');
        }
      } else {
        setError(data.message || '注册失败，请重试');
      }
    } catch (err: any) {
      setError('注册失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    
    try {
      // 生成随机用户名和密码
      const guestUsername = 'guest_' + Date.now();
      const guestPassword = 'guest' + Date.now();
      
      // 注册游客账号
      const registerResponse = await fetch('https://lisqtboywrjw.sealoshzh.site/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: guestUsername, password: guestPassword })
      });
      
      if (!registerResponse.ok) {
        setError('游客登录失败，请检查网络连接');
        return;
      }
      
      let registerData;
      try {
        registerData = await registerResponse.json();
      } catch (jsonError) {
        setError('游客登录失败，服务器返回数据格式错误');
        return;
      }
      
      if (registerData.code === 200) {
        // 登录游客账号
        const loginResponse = await fetch('https://lisqtboywrjw.sealoshzh.site/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: guestUsername, password: guestPassword })
        });
        
        if (!loginResponse.ok) {
          setError('游客登录失败，请检查网络连接');
          return;
        }
        
        let loginData;
        try {
          loginData = await loginResponse.json();
        } catch (jsonError) {
          setError('游客登录失败，服务器返回数据格式错误');
          return;
        }
        
        if (loginData.code === 200) {
          localStorage.setItem('token', loginData.data.token);
          localStorage.setItem('userInfo', JSON.stringify(loginData.data.userInfo));
          onLogin(loginData.data.userInfo.userId);
        } else {
          setError('游客登录失败，请重试');
        }
      } else {
        setError('游客登录失败，请重试');
      }
    } catch (err: any) {
      setError('游客登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-amber-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">
          <div className="text-center mb-16">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-[24px] blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-[24px] shadow-2xl shadow-red-500/20 animate-float">
                <span className="text-5xl animate-coin">📝</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-300 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-sparkle">
                <span className="text-xs">✨</span>
              </div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-red-300 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-sparkle" style={{ animationDelay: '0.5s' }}>
                <span className="text-[8px]">✨</span>
              </div>
              <div className="absolute top-1/2 -right-4 w-3 h-3 bg-gradient-to-br from-red-300 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-sparkle" style={{ animationDelay: '1s' }}>
                <span className="text-[6px]">✨</span>
              </div>
            </div>
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-pink-400 to-red-500 mb-3 tracking-tight drop-shadow-2xl" style={{ textShadow: '0 0 40px rgba(249, 168, 212, 0.5)' }}>
              荔枝记账
            </h1>
            <p className="text-lg text-gray-400 font-medium">
              立志赚钱用荔枝记账
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
              <button
                onClick={() => setLoginType('login')}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  loginType === 'login'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                登录
              </button>
              <button
                onClick={() => setLoginType('register')}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  loginType === 'register'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                注册
              </button>
            </div>

            {loginType === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-400">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all font-medium"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-400">
                    密码
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all font-medium"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm font-medium text-center">
                    {error}
                  </div>
                )}

                <div className="flex items-start space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="privacy-agree"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 text-wealth rounded border-gray-600 focus:ring-wealth focus:ring-2"
                  />
                  <label htmlFor="privacy-agree" className="text-xs text-gray-400 cursor-pointer">
                    我已阅读并同意<span className="text-wealth">隐私政策</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !username.trim() || !password.trim() || !privacyAgreed}
                  className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
                    loading || !username.trim() || !password.trim()
                      ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></span>
                      <span>登录中...</span>
                    </span>
                  ) : (
                    '立即登录'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
                    loading
                      ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-400 rounded-full animate-spin"></span>
                      <span>登录中...</span>
                    </span>
                  ) : (
                    '游客登录'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-400">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all font-medium"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-400">
                    密码
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码（至少6位）"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all font-medium"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-400">
                    确认密码
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入密码"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all font-medium"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm font-medium text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !username.trim() || !password.trim() || !confirmPassword.trim()}
                  className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
                    loading || !username.trim() || !password.trim() || !confirmPassword.trim()
                      ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></span>
                      <span>注册中...</span>
                    </span>
                  ) : (
                    '立即注册'
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center justify-center text-gray-500">
              <button 
                onClick={() => setShowPrivacy(true)}
                className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                隐私政策
              </button>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
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
                className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                查看完整隐私政策
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 隐私政策弹窗 */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                隐私政策
              </h3>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
              <p>我们重视您的隐私保护，致力于为您提供安全、可靠的记账服务。</p>
              <p><strong>我们收集的信息：</strong></p>
              <ul className="list-disc pl-5 space-y-2">
                <li>您的用户名和密码（用于登录验证）</li>
                <li>您的记账数据（用于目标管理和统计分析）</li>
                <li>您的设备信息（用于保障账户安全）</li>
              </ul>
              <p><strong>我们如何使用您的信息：</strong></p>
              <ul className="list-disc pl-5 space-y-2">
                <li>提供和改进我们的服务</li>
                <li>保障您的账户安全</li>
                <li>进行数据分析和统计</li>
              </ul>
              <p><strong>我们不会：</strong></p>
              <ul className="list-disc pl-5 space-y-2">
                <li>向第三方分享您的个人信息</li>
                <li>在未经您同意的情况下使用您的信息</li>
                <li>收集与服务无关的信息</li>
              </ul>
              <p className="mt-4">
                如您对我们的隐私保护政策有任何疑问，请联系我们。
              </p>
            </div>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setShowPrivacy(false)}
                className="w-full py-3 rounded-2xl font-bold text-white bg-wealth hover:bg-emerald-600 transition-colors"
              >
                我知道了
              </button>
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
                className="w-full py-3 rounded-2xl font-bold text-white bg-gray-500 hover:bg-gray-600 transition-colors"
              >
                查看完整隐私政策
              </button>
            </div>
          </div>
        </div>
      )}




    </div>
  );
};

export default Login;
