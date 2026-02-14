import React, { useState } from 'react';

interface LoginProps {
  onLogin: (userId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginType, setLoginType] = useState<'phone' | 'employee'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!phone.trim()) {
      setError('请输入手机号');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      setError('请输入正确的手机号');
      return;
    }

    setSendingCode(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('发送验证码失败，请重试');
    } finally {
      setSendingCode(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phone.trim()) {
      setError('请输入手机号');
      return;
    }
    if (!code.trim()) {
      setError('请输入验证码');
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onLogin('phone_' + phone.trim());
    } catch (err) {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!employeeId.trim()) {
      setError('请输入员工号');
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onLogin(employeeId.trim());
    } catch (err) {
      setError('登录失败，请重试');
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
              轻松记账·理财有方
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
              <button
                onClick={() => setLoginType('phone')}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  loginType === 'phone'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                手机号登录
              </button>
              <button
                onClick={() => setLoginType('employee')}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  loginType === 'employee'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                员工号登录
              </button>
            </div>

            {loginType === 'phone' ? (
              <form onSubmit={handlePhoneLogin} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-400">
                    手机号码
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入手机号"
                    maxLength={11}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all font-medium"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-400">
                    验证码
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="请输入验证码"
                      maxLength={6}
                      className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all font-medium"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={sendingCode || countdown > 0 || !phone.trim()}
                      className={`px-6 rounded-2xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                        sendingCode || countdown > 0 || !phone.trim()
                          ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      {countdown > 0 ? `${countdown}s` : sendingCode ? '发送中...' : '获取验证码'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-400 text-sm font-medium text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !phone.trim() || !code.trim()}
                  className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
                    loading || !phone.trim() || !code.trim()
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
              </form>
            ) : (
              <form onSubmit={handleEmployeeLogin} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-400">
                    员工编号
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="请输入员工号"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all font-medium"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm font-medium text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !employeeId.trim()}
                  className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${
                    loading || !employeeId.trim()
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
              </form>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center justify-center space-x-8 text-gray-500">
              <span className="text-xs font-medium">功能介绍</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span className="text-xs font-medium">隐私保护</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span className="text-xs font-medium">用户协议</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
