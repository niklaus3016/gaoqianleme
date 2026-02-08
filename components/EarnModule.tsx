
import React, { useState, useEffect } from 'react';
import { goldService, recordService } from '../services/backendService';
import { CoinLog } from '../types';

interface EarnModuleProps {
  userId: string;
}

const EarnModule: React.FC<EarnModuleProps> = ({ userId }) => {
  const [totalCoins, setTotalCoins] = useState(0);
  const [todayCoins, setTodayCoins] = useState(0);
  const [logs, setLogs] = useState<CoinLog[]>([]);
  const [floats, setFloats] = useState<{ id: number, x: number, y: number, amount: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string>('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [alipayAccount, setAlipayAccount] = useState('');
  const [alipayName, setAlipayName] = useState('');
  const [withdrawError, setWithdrawError] = useState<string>('');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastMonthGold, setLastMonthGold] = useState(0);
  const [currentMonthGold, setCurrentMonthGold] = useState(0);

  const speak = (text: string) => {
    if (!voiceEnabled) return;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.1;
      utterance.pitch = 1.3;
      utterance.volume = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const chineseVoice = voices.find(voice => 
        voice.lang.includes('zh') && voice.name.includes('Female')
      ) || voices.find(voice => voice.lang.includes('zh'));
      
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    loadGoldInfo();
    loadTodayGold();
    loadWithdrawals();
    loadMonthlyGold();
  }, []);

  const loadGoldInfo = async () => {
    try {
      const response = await goldService.getInfo(userId);
      if (response.code === 200 && response.data) {
        setTotalCoins(response.data.totalGold);
        const formattedLogs = response.data.details.map((detail: any, index: number) => ({
          id: index.toString(),
          amount: detail.goldNum,
          time: new Date(detail.createTime).toLocaleTimeString('zh-CN', { hour12: false })
        }));
        setLogs(formattedLogs.slice(0, 50));
      }
    } catch (error) {
      console.error('Failed to load gold info:', error);
    }
  };

  const loadTodayGold = async () => {
    try {
      const response = await goldService.getToday(userId);
      if (response.code === 200 && response.data) {
        setTodayCoins(response.data.todayGold);
      }
    } catch (error) {
      console.error('Failed to load today gold:', error);
    }
  };

  const loadWithdrawals = async () => {
    try {
      const response = await goldService.getWithdrawals(userId, 10);
      console.log('Withdrawals response:', response);
      if (response.code === 200 && response.data) {
        console.log('Withdrawals data:', response.data);
        setWithdrawals(response.data);
      }
    } catch (error) {
      console.error('Failed to load withdrawals:', error);
    }
  };

  const loadMonthlyGold = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      console.log('Loading monthly gold:', { userId, year, month });
      const response = await goldService.getMonthlyGold(userId, year, month);
      console.log('Monthly gold response:', response);
      if (response.code === 200 && response.data) {
        setLastMonthGold(response.data.lastMonthGold || 0);
        setCurrentMonthGold(response.data.currentMonthGold || 0);
        console.log('Set monthly gold:', { lastMonthGold: response.data.lastMonthGold, currentMonthGold: response.data.currentMonthGold });
      }
    } catch (error) {
      console.error('Failed to load monthly gold:', error);
    }
  };

  const handleEarn = async (e: React.MouseEvent) => {
    if (loading || cooldown > 0) return;
    setLoading(true);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    try {
      const response = await goldService.click(userId);
      if (response.code === 200 && response.data) {
        const { goldEarned, totalGold, todayGold, remainingSeconds } = response.data;
        
        setTotalCoins(totalGold);
        setTodayCoins(todayGold);
        
        const newLog: CoinLog = {
          id: Date.now().toString(),
          amount: goldEarned,
          time: new Date().toLocaleTimeString('zh-CN', { hour12: false })
        };
        setLogs(prev => [newLog, ...prev.slice(0, 49)]);

        const id = Date.now();
        setFloats(prev => [...prev, { id, x: clickX, y: clickY, amount: goldEarned }]);
        
        if (window.navigator.vibrate) {
          window.navigator.vibrate(10);
        }

        setTimeout(() => {
          setFloats(prev => prev.filter(f => f.id !== id));
        }, 800);

        speak(`恭喜你又赚了${goldEarned}金币`);

        const cooldownSeconds = remainingSeconds > 0 ? remainingSeconds : 10;
        setCooldown(cooldownSeconds);
        const timer = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        await loadMonthlyGold();
      }
    } catch (error: any) {
      console.error('Failed to earn gold:', error);
      
      if (error.message && error.message.includes('请等待')) {
        const match = error.message.match(/(\d+)\s*秒/);
        if (match) {
          const remainingSeconds = parseInt(match[1]);
          setCooldown(remainingSeconds);
          const timer = setInterval(() => {
            setCooldown(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = () => {
    if (lastMonthGold === 0) {
      setWithdrawError('上月金币已全部提现');
      return;
    }

    if (!alipayAccount || !alipayName) {
      setWithdrawError('请填写完整的支付宝信息');
      return;
    }
    
    if (lastMonthGold < 1000) {
      setWithdrawError('上月累计金币不足1000，无法提现');
      return;
    }
    
    setWithdrawError('');
    setShowConfirmModal(true);
  };

  const confirmWithdraw = async () => {
    setShowConfirmModal(false);
    setShowWithdrawModal(false);
    setWithdrawLoading(true);
    
    try {
      const response = await goldService.withdraw(userId, alipayAccount, alipayName, lastMonthGold);
      if (response.code === 200) {
        const withdrawAmount = lastMonthGold / 1000;
        
        try {
          await recordService.add(userId, withdrawAmount, 'income', '副业收入', '电子手工');
          console.log('Successfully added accounting record:', { amount: withdrawAmount, category: '副业收入', description: '电子手工' });
        } catch (recordError) {
          console.error('Failed to add accounting record:', recordError);
        }
        
        setAlipayAccount('');
        setAlipayName('');
        setTotalCoins(totalCoins - lastMonthGold);
        await loadWithdrawals();
        await loadMonthlyGold();
        alert('提现申请已提交，财务将在1-3个工作日内打款\n已自动在记账模块添加收入记录');
        speak('提现申请已提交');
      } else {
        setShowWithdrawModal(true);
        setWithdrawError(response.message || '提现失败，请重试');
      }
    } catch (error: any) {
      console.error('Failed to withdraw:', error);
      setShowWithdrawModal(true);
      setWithdrawError(error.message || '提现失败，请重试');
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 flex flex-col items-center">
      
      {error && (
        <div className="w-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-bold">
          {error}
        </div>
      )}
      
      {/* 顶部财富看板 - 紧凑版 */}
      <div className="w-full flex space-x-2 px-1">
        {/* 上月累计金币：可提现 */}
        <div className="flex-1 glass rounded-xl p-2.5 border-b border-emerald-500/30 relative overflow-hidden group">
          <p className="text-[8px] font-bold text-emerald-600/60 dark:text-emerald-400/50 mb-0.5">上月累计</p>
          {lastMonthGold > 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-emerald-700 dark:text-emerald-400">{lastMonthGold.toLocaleString()}</span>
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={lastMonthGold < 1000}
                className={`text-[8px] font-bold px-2 py-1 rounded-md transition-all ${
                  lastMonthGold >= 1000
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                提现
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-5">
              <span className="text-[8px] font-bold text-emerald-600/80 dark:text-emerald-400/80">已全部提现</span>
            </div>
          )}
        </div>
        
        {/* 本月累计金币：不可提现 */}
        <div className="flex-1 glass rounded-xl p-2.5 border-b border-amber-500/30 relative overflow-hidden group">
          <p className="text-[8px] font-bold text-amber-600/60 dark:text-amber-400/50 mb-0.5">本月累计</p>
          <div className="flex items-center">
            <span className="text-base font-black text-amber-600 dark:text-amber-400">{currentMonthGold.toLocaleString()}</span>
          </div>
        </div>

        {/* 今日金币 */}
        <div className="flex-1 glass rounded-xl p-2.5 border-b border-blue-500/30 relative overflow-hidden group">
          <p className="text-[8px] font-bold text-blue-600/60 dark:text-blue-400/50 mb-0.5">今日金币</p>
          <div className="flex items-center">
            <span className="text-base font-black text-blue-600 dark:text-blue-400">{todayCoins.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 语音开关 */}
      <div className="w-full flex justify-end px-1">
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
            voiceEnabled 
              ? 'bg-wealth text-white shadow-md shadow-wealth/20' 
              : 'bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'
          }`}
        >
          <span className="text-xs">{voiceEnabled ? '🔊' : '🔇'}</span>
          <span>{voiceEnabled ? '语音' : '静音'}</span>
        </button>
      </div>

      {/* 动力采集核心区 */}
      <div className="relative mt-12 mb-6">
        {/* 背景光晕层 */}
        <div className="absolute inset-0 rounded-full bg-wealth/20 blur-[60px] animate-pulse"></div>
        
        {/* 动态装饰环 */}
        <div className="absolute inset-0 rounded-full border-2 border-wealth/10 scale-125 animate-spin-slow"></div>
        <div className="absolute inset-0 rounded-full border border-wealth/5 scale-150 animate-reverse-spin-slow"></div>
        
        {/* 核心搞钱按钮 */}
        <button 
          onClick={handleEarn}
          disabled={loading || cooldown > 0}
          className={`relative w-64 h-64 rounded-full shadow-[0_25px_70px_rgba(16,185,129,0.5)] flex flex-col items-center justify-center border-[12px] border-white/20 active:scale-95 active:shadow-inner transition-all group overflow-hidden ${
            loading || cooldown > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-br from-wealth via-emerald-500 to-teal-600'
          }`}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {cooldown > 0 && (
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="3"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - cooldown / 10)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
          )}
          
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-7xl mb-3 filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
              {loading ? '⏳' : cooldown > 0 ? '⏳' : '🤑'}
            </span>
            <span className="text-2xl font-black text-white tracking-widest drop-shadow-sm uppercase">
              {loading ? '加载中...' : cooldown > 0 ? `${cooldown}` : '立即赚金币'}
            </span>
            <div className="flex items-center space-x-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span className="text-[10px] text-white/80 font-black tracking-widest uppercase">
                {loading || cooldown > 0 ? '请稍候' : '财富源已激活'}
              </span>
            </div>
          </div>

          {floats.map(f => (
            <span 
              key={f.id} 
              className="coin-float text-4xl font-black text-yellow-400 z-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              style={{ left: f.x, top: f.y }}
            >
              +{f.amount}
            </span>
          ))}
        </button>
      </div>

      {/* 采集日志卡片 */}
      <div className="w-full glass rounded-[32px] p-6 shadow-xl border border-white/10 dark:bg-zinc-900/40">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-gray-400 tracking-[0.2em] uppercase">财富采集流水</h3>
          <span className="text-[10px] font-bold text-wealth bg-wealth/10 px-2 py-0.5 rounded-md">实时更新</span>
        </div>
        
        <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-wealth/20 scrollbar-track-transparent">
          {logs.map((log, index) => (
            <div 
              key={log.id} 
              className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-white/5 last:border-0 animate-in slide-in-from-left-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg shadow-inner">
                  💰
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-gray-100 italic">金币收益</p>
                  <p className="text-[10px] text-gray-400 font-mono font-medium">{log.time}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                  {log.amount >= 0 ? '+' : ''}{log.amount} 金币
                </span>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="py-10 text-center">
              <span className="text-3xl opacity-20 block mb-2">⚡</span>
              <p className="text-xs text-gray-400 font-bold italic">准备就绪，点击上方按钮激发斗志！</p>
            </div>
          )}
        </div>
      </div>

      {/* 提现记录卡片 */}
      {withdrawals.length > 0 && (
        <div className="w-full glass rounded-[32px] p-6 shadow-xl border border-white/10 dark:bg-zinc-900/40">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-gray-400 tracking-[0.2em] uppercase">提现记录</h3>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">共 {withdrawals.length} 条</span>
          </div>
          
          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-wealth/20 scrollbar-track-transparent">
            {withdrawals.map((withdrawal, index) => (
              <div 
                key={withdrawal.withdrawalId || index} 
                className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-white/5 last:border-0 animate-in slide-in-from-left-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-lg shadow-inner">
                    💳
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-gray-100">提现到支付宝</p>
                    <p className="text-[10px] text-gray-400 font-mono font-medium">
                      {withdrawal.alipayAccount?.slice(0, 3)}***{withdrawal.alipayAccount?.slice(-3)}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      {withdrawal.createTime ? new Date(withdrawal.createTime).toLocaleString('zh-CN', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    +{withdrawal.amount?.toFixed(2)} 元
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 提现模态框 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">提现到支付宝</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-500 dark:text-gray-400 mb-2">上月累计金币</label>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{lastMonthGold.toLocaleString()} 金币</div>
                <div className="mt-2 p-3 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-xl">
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-1">可提现金额</p>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {(lastMonthGold / 1000).toFixed(2)} 元
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  本月累计 {currentMonthGold.toLocaleString()} 金币不可提现
                </p>
              </div>

              <div>
                <label className="text-xs font-black text-gray-500 dark:text-gray-400 mb-2">支付宝账号</label>
                <input
                  type="text"
                  placeholder="请输入支付宝账号"
                  value={alipayAccount}
                  onChange={e => setAlipayAccount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 border-2 border-transparent focus:border-wealth/30 focus:outline-none rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-500 dark:text-gray-400 mb-2">支付宝姓名</label>
                <input
                  type="text"
                  placeholder="请输入支付宝姓名"
                  value={alipayName}
                  onChange={e => setAlipayName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-800 border-2 border-transparent focus:border-wealth/30 focus:outline-none rounded-xl text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-all"
                />
              </div>

              {withdrawError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-bold">
                  {withdrawError}
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 font-bold py-3.5 rounded-xl border-2 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400 transition-all active:scale-95"
                >
                  取消
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawLoading || totalCoins < 1000}
                  className={`flex-1 font-bold py-3.5 rounded-xl transition-all active:scale-95 ${
                    withdrawLoading || totalCoins < 1000
                      ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                      : 'bg-wealth text-white shadow-lg shadow-wealth/20 hover:bg-emerald-600'
                  }`}
                >
                  {withdrawLoading ? '提交中...' : '确认提现'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 提现确认模态框 */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">确认提现信息</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border-2 border-amber-500/20 rounded-xl">
                <p className="text-xs font-black text-amber-600 dark:text-amber-400 mb-3">请核对以下信息</p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">提现金币</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white">
                      {lastMonthGold.toLocaleString()} 金币
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">提现金额</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {(lastMonthGold / 1000).toFixed(2)} 元
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-amber-500/20">
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">支付宝账号</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white">
                      {alipayAccount}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">支付宝姓名</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white">
                      {alipayName}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 text-center">
                确认无误后点击下方按钮提交提现申请
              </p>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 font-bold py-3.5 rounded-xl border-2 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-400 transition-all active:scale-95"
                >
                  返回修改
                </button>
                <button
                  onClick={confirmWithdraw}
                  disabled={withdrawLoading}
                  className={`flex-1 font-bold py-3.5 rounded-xl transition-all active:scale-95 ${
                    withdrawLoading
                      ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600'
                  }`}
                >
                  {withdrawLoading ? '提交中...' : '确认提交'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-up {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -150px) scale(2); opacity: 0; }
        }
        .coin-float {
          position: absolute;
          animation: float-up 0.8s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
          pointer-events: none;
          transform: translate(-50%, -50%);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes reverse-spin-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-reverse-spin-slow {
          animation: reverse-spin-slow 8s linear infinite;
        }
      `}} />
    </div>
  );
};

export default EarnModule;
