
import React, { useState, useEffect } from 'react';
import { targetService, recordService } from '../services/backendService';
import { Solar, Lunar } from 'lunar-javascript';

interface GoalModuleProps {
  userId: string;
}

const GoalModule: React.FC<GoalModuleProps> = ({ userId }) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  const year = today.getFullYear();
  
  const endOfYear = new Date(year, 11, 31);
  const daysLeft = Math.ceil((endOfYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const [annualGoal, setAnnualGoal] = useState<number | null>(null);
  const [currentEarned, setCurrentEarned] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lunarDate, setLunarDate] = useState('加载中...');
  const [zodiacYear, setZodiacYear] = useState('加载中...');
  const [yi, setYi] = useState<string[]>([]);
  const [ji, setJi] = useState<string[]>([]);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalInputValue, setGoalInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadTarget();
    loadLunarInfo();
  }, []);

  const loadTarget = async () => {
    try {
      const targetDate = `${year}-01-01`;
      const response = await targetService.get(userId, targetDate);
      if (response.code === 200 && response.data && typeof response.data.target === 'number') {
        setAnnualGoal(response.data.target);
      }
      
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
      const [incomeRes, bonusRes, otherRes] = await Promise.all([
        recordService.getTotal(userId, startDate, endDate, 'income'),
        recordService.getTotal(userId, startDate, endDate, 'bonus'),
        recordService.getTotal(userId, startDate, endDate, 'other')
      ]);
      
      const total = (incomeRes.data?.total || 0) + (bonusRes.data?.total || 0) + (otherRes.data?.total || 0);
      setCurrentEarned(total);
    } catch (error) {
      console.error('Failed to load target:', error);
    }
  };

  const handleSetGoal = async () => {
    const targetAmount = parseFloat(goalInputValue);
    console.log('handleSetGoal called, targetAmount:', targetAmount);
    if (!targetAmount || targetAmount <= 0) {
      alert('请输入有效的目标金额');
      return;
    }
    
    setLoading(true);
    console.log('Setting target...');
    try {
      const targetDate = `${year}-01-01`;
      console.log('Calling targetService.set with:', { userId, targetAmount, period: 'year', targetDate });
      const response = await targetService.set(userId, targetAmount, 'year', targetDate);
      console.log('Response:', response);
      if (response.code === 200) {
        await loadTarget();
        setShowGoalInput(false);
        setIsEditing(false);
        setGoalInputValue('');
        setShowSuccessModal(true);
        // 3秒后自动关闭弹窗
        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        alert(response.message || '设置失败，请重试');
      }
    } catch (error: any) {
      console.error('Failed to set target:', error);
      alert(error.message || '设置失败，请重试');
    } finally {
      console.log('Finally, setting loading to false');
      setLoading(false);
    }
  };

  const handleEditGoal = () => {
    setGoalInputValue(annualGoal?.toString() || '');
    setIsEditing(true);
    setShowGoalInput(true);
  };

  const loadLunarInfo = () => {
    try {
      const solar = Solar.fromDate(today);
      const lunar = solar.getLunar();
      
      const lunarMonth = lunar.getMonthInChinese();
      const lunarDay = lunar.getDayInChinese();
      setLunarDate(`${lunarMonth}${lunarDay}`);
      
      const yearZodiac = lunar.getYearShengXiao();
      const yearGanZhi = lunar.getYearInGanZhi();
      setZodiacYear(`${yearGanZhi}${yearZodiac}年`);
      
      const dayYi = lunar.getDayYi();
      const dayJi = lunar.getDayJi();
      setYi(dayYi);
      setJi(dayJi);
    } catch (error) {
      console.error('Failed to load lunar info:', error);
      setLunarDate('暂无数据');
      setZodiacYear('暂无数据');
      setYi([]);
      setJi([]);
    }
  };

  const progress = annualGoal && annualGoal > 0 ? (currentEarned / annualGoal) * 100 : 0;
  const remaining = annualGoal ? annualGoal - currentEarned : 0;

  return (
    <div className="flex flex-col space-y-3 pb-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* 顶部：日历栏 */}
      <div className="flex justify-between items-center px-5 py-5 shrink-0 bg-white/5 dark:bg-white/2 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-white bg-wealth px-2 py-0.5 rounded-full tracking-tighter">今日</span>
            <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white leading-none">
              {year}年{dateStr}
            </h2>
          </div>
          <div className="flex items-center space-x-2 ml-8">
            <span className="text-sm bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold">
              {lunarDate}
            </span>
            <span className="text-sm font-black text-wealth tracking-widest">
              {zodiacYear}
            </span>
          </div>
        </div>
        
        {/* 剩余天数展示区 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-wealth/20 to-gold/20 rounded-[22px] blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-white dark:bg-zinc-800 px-3.5 py-2.5 rounded-[20px] border border-slate-100 dark:border-white/10 shadow-sm flex flex-col items-center justify-center min-w-[70px]">
            <div className="flex items-center space-x-1 mb-1">
              <span className="text-[10px] font-black text-wealth">⌛</span>
              <span className="text-[9px] font-black text-gray-400 tracking-tighter uppercase">剩余</span>
            </div>
            <div className="flex items-baseline space-x-0.5">
              <span className={`text-2xl font-mono font-black leading-none tracking-tighter ${
                daysLeft > 200 ? 'text-emerald-600 dark:text-emerald-400' :
                daysLeft >= 100 ? 'text-amber-600 dark:text-amber-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {daysLeft}
              </span>
              <span className="text-[10px] font-bold text-wealth">天</span>
            </div>
          </div>
        </div>
      </div>

      {/* 宜忌模块 */}
      <div className="grid grid-cols-2 gap-3 px-1 shrink-0">
        <div className="bg-emerald-500/[0.04] dark:bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] p-5 shadow-sm min-h-[100px] flex flex-col justify-start transition-all hover:bg-emerald-500/[0.06]">
          <div className="flex items-center space-x-1.5 mb-2.5">
            <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-[10px] text-white font-black">宜</div>
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 tracking-wider">事半功倍</span>
          </div>
          <p className="text-xs font-bold leading-relaxed text-gray-700 dark:text-gray-200">
            {yi.length > 0 ? yi.join('、') : '加载中...'}
          </p>
        </div>
        <div className="bg-rose-500/[0.04] dark:bg-rose-500/10 border border-rose-500/20 rounded-[24px] p-5 shadow-sm min-h-[100px] flex flex-col justify-start transition-all hover:bg-rose-500/[0.06]">
          <div className="flex items-center space-x-1.5 mb-2.5">
            <div className="w-5 h-5 rounded-md bg-rose-500 flex items-center justify-center text-[10px] text-white font-black">忌</div>
            <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 tracking-wider">损财之举</span>
          </div>
          <p className="text-xs font-bold leading-relaxed text-gray-700 dark:text-gray-200">
            {ji.length > 0 ? ji.join('、') : '加载中...'}
          </p>
        </div>
      </div>

      {/* 核心搞钱目标展示区 */}
      <div className="relative overflow-hidden rounded-[32px] bg-white dark:bg-zinc-900/40 p-1 shadow-xl border border-slate-200 dark:border-white/5 group flex flex-col min-h-[170px]">
        <div className="absolute top-0 right-0 w-20 h-20 bg-wealth/5 rounded-full blur-[40px] -mr-4 -mt-4"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gold/5 rounded-full blur-[40px] -ml-4 -mb-4"></div>
        
        {annualGoal === null ? (
          <div className="relative z-10 flex flex-col flex-1 p-5 space-y-4 justify-center items-center">
            {showGoalInput ? (
              <div className="w-full max-w-[280px] space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-wealth mb-2">💰</div>
                  <p className="text-sm font-bold text-slate-600 mb-4">设置你的年度赚钱目标</p>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-black text-wealth">￥</span>
                  <input 
                    type="number"
                    placeholder="输入目标金额"
                    value={goalInputValue}
                    onChange={e => setGoalInputValue(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100/50 dark:bg-white/5 border-2 border-transparent focus:border-wealth/30 focus:outline-none rounded-2xl text-2xl font-black text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-all"
                    autoFocus
                  />
                </div>
                <button 
                  onClick={handleSetGoal}
                  disabled={loading || !goalInputValue}
                  className={`w-full font-black py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2 ${
                    loading || !goalInputValue
                      ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                      : 'bg-wealth hover:bg-emerald-600 text-white shadow-wealth/20'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>设置中...</span>
                    </span>
                  ) : (
                    <>
                      <span>确认设置</span>
                      <span className="text-xl">🎯</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center cursor-pointer" onClick={() => setShowGoalInput(true)}>
                  <div className="text-4xl font-black text-slate-400 mb-2 animate-bounce">🎯</div>
                  <p className="text-base font-bold text-wealth animate-pulse">请先输入年度赚钱目标</p>
                </div>
            )}
          </div>
        ) : (
          <div className="relative z-10 flex flex-col flex-1 p-5 space-y-4 justify-center">
            {isEditing ? (
              <div className="w-full max-w-[280px] space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-wealth mb-2">✏️</div>
                  <p className="text-sm font-bold text-slate-600 mb-4">修改你的年度赚钱目标</p>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-black text-wealth">￥</span>
                  <input 
                    type="number"
                    placeholder="输入目标金额"
                    value={goalInputValue}
                    onChange={e => setGoalInputValue(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100/50 dark:bg-white/5 border-2 border-transparent focus:border-wealth/30 focus:outline-none rounded-2xl text-2xl font-black text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setShowGoalInput(false);
                      setGoalInputValue('');
                    }}
                    className="flex-1 font-black py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400"
                  >
                    <span>取消</span>
                  </button>
                  <button 
                    onClick={handleSetGoal}
                    disabled={loading || !goalInputValue}
                    className={`flex-1 font-black py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2 ${
                      loading || !goalInputValue
                        ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                        : 'bg-wealth hover:bg-emerald-600 text-white shadow-wealth/20'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>保存中...</span>
                      </span>
                    ) : (
                      <>
                        <span>保存</span>
                        <span className="text-xl">💾</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center space-x-2 mb-1.5">
                  <div className="h-[1px] w-4 bg-slate-200 dark:bg-white/10"></div>
                  <span className="text-[10px] font-black text-slate-400 tracking-[0.3em]">年度搞钱目标</span>
                  <div className="h-[1px] w-4 bg-slate-200 dark:bg-white/10"></div>
                </div>
                
                <div className="relative inline-flex items-center">
                  <span className="text-xs font-black gold-text italic mt-2 mr-1">￥</span>
                  <span className="text-4xl sm:text-5xl font-black gold-text tracking-tighter leading-none">
                    {annualGoal.toLocaleString()}
                  </span>
                  <div className="absolute -right-7 -top-2 animate-bounce-gentle text-2xl">💰</div>
                </div>
                
                <button 
                  onClick={handleEditGoal}
                  className="mt-2 text-[10px] font-black text-wealth hover:text-emerald-600 transition-colors flex items-center space-x-1"
                >
                  <span>✏️</span>
                  <span>修改目标</span>
                </button>
              </div>
            )}

            <div className="w-full max-w-[260px] mx-auto space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 tracking-widest">达成进度</span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-bold text-wealth">达成率</span>
                  <span className="text-[11px] font-black py-0.5 px-2 rounded-lg bg-wealth text-white shadow-lg">
                    {progress.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="overflow-hidden h-2.5 flex rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-0.5">
                <div 
                  style={{ width: `${progress}%` }} 
                  className="h-full rounded-full bg-gradient-to-r from-wealth via-emerald-400 to-gold relative transition-all duration-1000 ease-out"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 px-0.5">
                <div className="flex flex-col">
                  <p className="text-[9px] text-gray-400 font-bold tracking-widest mb-0.5 uppercase">已到账</p>
                  <p className="text-base font-black text-wealth leading-none tracking-tight">
                    {currentEarned.toLocaleString()}
                  </p>
                </div>
                <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10 opacity-60"></div>
                <div className="flex flex-col text-right">
                  <p className="text-[9px] text-gray-400 font-bold tracking-widest mb-0.5 uppercase">剩余差额</p>
                  <p className="text-base font-black text-rose-500 leading-none tracking-tight">
                    {remaining.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 搞钱金句栏：回滚至致富圣经 居中协调版 */}
      <div className="px-0 shrink-0">
        <div className="relative overflow-hidden group bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-[24px] px-6 py-5 flex flex-col items-center justify-center text-center shadow-sm">
          {/* 背景修饰线条 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-gradient-to-r from-transparent via-wealth/30 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-gradient-to-r from-transparent via-wealth/30 to-transparent"></div>
          
          <div className="relative z-10 space-y-2">
            {/* 装饰小星 */}
            <div className="flex items-center justify-center space-x-2 text-wealth/40 mb-1">
              <span className="text-[8px]">✦</span>
              <span className="text-[10px]">✦</span>
              <span className="text-[8px]">✦</span>
            </div>

            {/* 动态金句 */}
            <p className="text-[14px] font-bold text-slate-800 dark:text-gray-100 italic leading-snug max-w-[280px]">
              "{dailyQuote}"
            </p>

            {/* 固定辅助标题 */}
            <div className="flex flex-col items-center mt-3">
              <div className="h-[1px] w-8 bg-slate-100 dark:bg-white/10 mb-1.5"></div>
              <h4 className="text-[9px] font-black text-wealth tracking-[0.4em] uppercase opacity-70">
                生命不休 · 搞钱不止
              </h4>
            </div>
          </div>
          
          {/* 悬浮交互光感 */}
          <div className="absolute inset-0 bg-gradient-to-tr from-wealth/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(-10%) rotate(10deg); }
          50% { transform: translateY(0) rotate(10deg); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2.5s ease-in-out infinite;
        }
        @keyframes slideInUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in-up {
          animation: slideInUp 0.3s ease-out;
        }
      `}} />

      {/* 成功提示弹窗 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-in-up">
            <div className="text-center">
              <div className="text-5xl mb-4 animate-bounce">🎯</div>
              <h3 className="text-xl font-bold gold-text mb-2">
                {isEditing ? '年度目标修改成功！' : '年度目标设置成功！'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                {isEditing ? '你的目标已更新，继续努力！' : '目标已设定，开始你的搞钱之旅吧！'}
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3.5 rounded-2xl font-bold text-white bg-wealth hover:bg-emerald-600 transition-all active:scale-95"
              >
                太棒了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalModule;
