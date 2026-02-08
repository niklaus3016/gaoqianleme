
import React, { useState, useEffect } from 'react';
import { lotteryService, goldService } from '../services/backendService';

interface LotteryHistory {
  drawDate: string;
  winningNumbers: string[];
  totalPool: number;
  totalTickets: number;
  prizeDistribution?: any;
}

interface UserTicket {
  _id: string;
  uid: string;
  ticketNumber: string;
  buyDate: string;
  drawDate: string;
  isWinning: boolean;
  prizeLevel: string;
  prizeAmount: number;
}

interface WelfareModuleProps {
  userId: string;
}

const WelfareModule: React.FC<WelfareModuleProps> = ({ userId }) => {
  const [luckyNumbers, setLuckyNumbers] = useState<string[]>([]);
  const [coins, setCoins] = useState(0);
  const [jackpot, setJackpot] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [participants, setParticipants] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [history, setHistory] = useState<LotteryHistory[]>([]);
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [lastCheckedDrawDate, setLastCheckedDrawDate] = useState<string | null>(null);
  const [winningNotification, setWinningNotification] = useState<{ show: boolean; amount: number; level: string }>({ show: false, amount: 0, level: '' });

  useEffect(() => {
    loadGoldInfo();
    loadLotteryStats();
    loadHistory();
    loadUserTickets();
    loadAllUserTickets();
    
    const interval = setInterval(checkLotteryResult, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkLotteryResult = async () => {
    try {
      const response = await lotteryService.getLatest();
      if (response.code === 200 && response.data && response.data.result) {
        const latestResult = response.data.result;
        if (latestResult.drawDate !== lastCheckedDrawDate) {
          const oldTickets = [...userTickets];
          const oldCoins = coins;
          setLastCheckedDrawDate(latestResult.drawDate);
          
          await loadGoldInfo();
          await loadAllUserTickets();
          await loadHistory();
          await loadLotteryStats();
          
          setTimeout(() => {
            const newTickets = userTickets;
            const winningTickets = newTickets.filter(ticket => 
              ticket.isWinning && !oldTickets.find(old => old._id === ticket._id)?.isWinning
            );
            
            if (winningTickets.length > 0) {
              const totalPrize = winningTickets.reduce((sum, ticket) => sum + ticket.prizeAmount, 0);
              const prizeLevelMap: Record<string, string> = {
                special: '特等奖',
                first: '一等奖',
                second: '二等奖',
                third: '三等奖'
              };
              const highestPrize = winningTickets.reduce((highest, ticket) => 
                ticket.prizeAmount > highest.prizeAmount ? ticket : highest
              );
              setWinningNotification({
                show: true,
                amount: totalPrize,
                level: prizeLevelMap[highestPrize.prizeLevel] || '中奖'
              });
              if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Failed to check lottery result:', error);
    }
  };

  const loadGoldInfo = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const response = await goldService.getMonthlyGold(userId, year, month);
      if (response.code === 200 && response.data) {
        setCoins(response.data.currentMonthGold);
      }
    } catch (error) {
      console.error('Failed to load gold info:', error);
    }
  };

  const loadLotteryStats = async () => {
    try {
      const response = await lotteryService.getStats();
      if (response.code === 200 && response.data) {
        setJackpot(response.data.totalTickets * 1000);
        setTotalTickets(response.data.totalTickets);
        setParticipants(response.data.participants);
      }
    } catch (error) {
      console.error('Failed to load lottery stats:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await lotteryService.getHistory(10);
      if (response.code === 200 && response.data) {
        setHistory(response.data.results);
      }
    } catch (error) {
      console.error('Failed to load lottery history:', error);
    }
  };

  const loadAllUserTickets = async () => {
    try {
      const response = await lotteryService.getAllTickets(userId);
      if (response.code === 200 && response.data) {
        setUserTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Failed to load all user tickets:', error);
    }
  };

  const loadUserTickets = async () => {
    try {
      const today = new Date();
      const drawDate = today.toISOString().split('T')[0];
      console.log('Loading user tickets with params:', { userId, drawDate });
      const response = await lotteryService.getTickets(userId, drawDate);
      console.log('User tickets response:', response);
      if (response.code === 200 && response.data) {
        const ticketNumbers = response.data.tickets.map(t => t.ticketNumber);
        setLuckyNumbers(ticketNumbers);
      }
    } catch (error) {
      console.error('Failed to load user tickets:', error);
    }
  };

  useEffect(() => {
    loadUserTickets();
  }, []);

  const handleBuyClick = () => {
    if (luckyNumbers.length >= 10) {
      if (window.navigator.vibrate) window.navigator.vibrate([50, 50, 50]);
      return;
    }
    if (coins < 1000) {
      if (window.navigator.vibrate) window.navigator.vibrate(100);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmBuy = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      const response = await lotteryService.buy(userId, 1);
      if (response.code === 200 && response.data) {
        const { tickets } = response.data;
        const ticketNumbers = tickets.map(t => t.ticketNumber);
        setLuckyNumbers([...luckyNumbers, ...ticketNumbers]);
        setError('');
        
        await loadGoldInfo();
        await loadLotteryStats();
        await loadAllUserTickets();
        
        if (window.navigator.vibrate) window.navigator.vibrate(10);
      }
    } catch (error: any) {
      console.error('Failed to buy ticket:', error);
      setError(error.message || '购买彩票失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
      
      {winningNotification.show && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🎉</span>
              <div>
                <p className="text-sm font-black">恭喜中奖！</p>
                <p className="text-xs font-bold opacity-90">{winningNotification.level} +{winningNotification.amount} 金币</p>
              </div>
            </div>
            <button 
              onClick={() => setWinningNotification({ show: false, amount: 0, level: '' })}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="w-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-bold">
          {error}
        </div>
      )}
      
      {/* 顶部标题区 */}
      <div className="text-center py-2">
        <h2 className="text-3xl font-black italic gold-text tracking-tighter">财富夺魁 🎰</h2>
        <div className="flex items-center justify-center space-x-2 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">每晚 20:00 准时揭晓</p>
        </div>
      </div>

      {/* 巨额奖池展示卡 */}
      <div className="relative overflow-hidden glass rounded-[32px] p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-zinc-900 to-black">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-wealth/10 rounded-full blur-[50px] -ml-16 -mb-16"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-[10px] font-black text-amber-500/80 tracking-[0.3em] uppercase mb-2">当前累积奖池 (金币)</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-6xl font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent tracking-tighter tabular-nums animate-pulse drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
              {jackpot.toLocaleString()}
            </span>
          </div>
          <div className="mt-4 px-3 py-1 bg-white/5 rounded-full border border-white/5">
            <p className="text-[9px] text-gray-400 font-bold tracking-widest">
              已有 <span className="text-wealth">{totalTickets.toLocaleString()}</span> 位老板参与夺魁
            </p>
          </div>
        </div>
      </div>

      {/* 个人资产与投注区 */}
      <div className="glass rounded-[32px] p-6 border border-white/10 dark:bg-zinc-900/40 shadow-xl">
        <div className="flex justify-between items-center mb-6 px-1">
          <div>
            <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-0.5">我的账户</p>
            <div className="flex items-center space-x-1">
              <span className="text-lg font-black text-amber-500">💰 {coins.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-0.5">当前持券</p>
            <p className="text-lg font-black text-slate-800 dark:text-white">{luckyNumbers.length} <span className="text-xs text-gray-500">/ 10</span></p>
          </div>
        </div>

        {/* 黄金奖券列表 */}
        <div className="grid grid-cols-1 gap-3 mb-8 p-5">
          {luckyNumbers.length === 0 ? (
            <div className="text-center space-y-2 opacity-30 py-12">
              <span className="text-5xl block">🎟️</span>
              <p className="text-xs font-bold tracking-widest text-gray-400">暂无奖券，虚位以待</p>
            </div>
          ) : (
            luckyNumbers.map((num, i) => (
              <div 
                key={i} 
                className="aspect-[4/1] bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                <div className="relative z-10 flex items-center justify-between w-full px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-xs font-black">{i + 1}</span>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold opacity-60 tracking-wider">NO.{num}</div>
                      <div className="text-lg font-black tracking-tight">幸运奖券</div>
                    </div>
                  </div>
                  <div className="text-3xl">🎟️</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 购买动作按钮 */}
        <button 
          onClick={handleBuyClick}
          disabled={luckyNumbers.length >= 10 || coins < 1000 || loading}
          className={`w-full py-5 rounded-[24px] font-black text-lg shadow-2xl transition-all active:scale-95 flex flex-col items-center justify-center relative overflow-hidden group ${
            luckyNumbers.length >= 10 || coins < 1000 || loading
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white shadow-amber-500/30'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
          
          <span className="relative z-10 flex items-center space-x-2">
            <span>{loading ? '购买中...' : luckyNumbers.length >= 10 ? '今日额度已满' : '购买幸运奖券'}</span>
            <span className="text-2xl">{loading ? '⏳' : '🎟️'}</span>
          </span>
          <div className="relative z-10 mt-3 px-3 py-1.5 bg-black/20 rounded-full border border-white/20">
            <span className="text-xs font-bold text-white tracking-wide">
              {luckyNumbers.length >= 10 ? '明天再来试试运气' : loading ? '正在处理...' : <span className="flex items-center justify-center space-x-1"><span>💰</span><span>消耗 1000 金币</span></span>}
            </span>
          </div>
        </button>
      </div>

      {/* 确认购买弹窗 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <div className="text-center space-y-4">
              <div className="text-5xl">🎟️</div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">确认购买</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  您将消耗 <span className="font-black text-amber-500">1000 金币</span> 购买 1 张幸运奖券
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 rounded-xl font-black text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmBuy}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '购买中...' : '确认购买'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 我的奖券区 */}
      <div className="glass rounded-[32px] p-6 shadow-xl border border-white/5 dark:bg-zinc-900/40">
        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">我的奖券</h3>
          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
            {userTickets.length} 张
          </span>
        </div>
        
        <div className="space-y-3">
          {userTickets.length === 0 ? (
            <div className="text-center py-8 space-y-2 opacity-30">
              <span className="text-4xl block">🎟️</span>
              <p className="text-xs font-bold tracking-widest text-gray-400">暂无奖券</p>
            </div>
          ) : (
            userTickets.map((ticket, i) => {
              const prizeLevelMap: Record<string, string> = {
                special: '特等奖',
                first: '一等奖',
                second: '二等奖',
                third: '三等奖',
                none: '未中奖'
              };
              const prizeLevelText = prizeLevelMap[ticket.prizeLevel] || '未中奖';
              const buyDate = new Date(ticket.buyDate);
              const formattedBuyDate = `${buyDate.getFullYear()}-${String(buyDate.getMonth() + 1).padStart(2, '0')}-${String(buyDate.getDate()).padStart(2, '0')}`;
              
              return (
                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-lg">
                      🎟️
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-gray-100">{ticket.ticketNumber}</p>
                      <p className="text-[9px] text-gray-500 font-bold">{formattedBuyDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {ticket.isWinning ? (
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 text-[9px] font-black bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full">
                          {prizeLevelText}
                        </span>
                        <p className="text-[10px] font-black text-green-500">+{ticket.prizeAmount} 金币</p>
                      </div>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-[9px] font-bold bg-gray-500/20 text-gray-500 rounded-full">
                        未中奖
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
      `}} />
    </div>
  );
};

export default WelfareModule;
