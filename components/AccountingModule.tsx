
import React, { useState, useEffect, useRef } from 'react';
import { recordService, targetService } from '../services/backendService';
import { IncomeRecord } from '../types';

const categories = [
  { id: 'salary', label: '主业收入', icon: '💼', color: 'bg-blue-500', type: 'income' },
  { id: 'side', label: '副业兼职', icon: '💻', color: 'bg-wealth', type: 'income' },
  { id: 'invest', label: '理财收益', icon: '📈', color: 'bg-amber-500', type: 'bonus' },
  { id: 'bonus', label: '意外奖金', icon: '🧧', color: 'bg-rose-500', type: 'bonus' },
  { id: 'other', label: '其他来源', icon: '✨', color: 'bg-slate-500', type: 'other' },
];

interface AccountingModuleProps {
  userId: string;
}

const AccountingModule: React.FC<AccountingModuleProps> = ({ userId }) => {
    const [records, setRecords] = useState<IncomeRecord[]>([]);
    const [form, setForm] = useState({ source: '', amount: '', category: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [todayTotal, setTodayTotal] = useState(0);
    const [monthTotal, setMonthTotal] = useState(0);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [swipedRecordId, setSwipedRecordId] = useState<string | null>(null);
    const touchStartXRef = useRef<number>(0);
    const recordIdRef = useRef<string | null>(null);

  useEffect(() => {
    loadRecords();
    loadTodayTotal();
    loadMonthTotal();
  }, []);

  useEffect(() => {
    loadMonthTotal();
    loadRecords();
  }, [selectedYear, selectedMonth]);

  const loadRecords = async () => {
    try {
      const response = await recordService.getMonth(userId, selectedYear, selectedMonth);
      if (response.code === 200 && response.data) {
        const formattedRecords = response.data.records.map((r: any) => ({
          id: r._id,
          source: r.description || r.type,
          amount: r.amount,
          timestamp: new Date(r.createTime).getTime(),
          category: r.category || getCategoryByType(r.type)
        }));
        
        const uniqueRecords = formattedRecords.filter((record, index, self) =>
          index === self.findIndex(r => r.id === record.id)
        );
        
        console.log('Loaded records:', uniqueRecords.map(r => ({ id: r.id, source: r.source, category: r.category })));
        setRecords(uniqueRecords);
      }
    } catch (error) {
      console.error('Failed to load records:', error);
    }
  };

  const loadTodayTotal = async () => {
    try {
      const today = new Date();
      const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const endDate = startDate;
      
      console.log('Loading today total for userId:', userId, 'startDate:', startDate, 'endDate:', endDate);
      
      const [incomeRes, bonusRes, otherRes] = await Promise.all([
        recordService.getTotal(userId, startDate, endDate, 'income'),
        recordService.getTotal(userId, startDate, endDate, 'bonus'),
        recordService.getTotal(userId, startDate, endDate, 'other')
      ]);
      
      const total = (incomeRes.data?.total || 0) + (bonusRes.data?.total || 0) + (otherRes.data?.total || 0);
      
      console.log('Today total response - income:', incomeRes.data?.total, 'bonus:', bonusRes.data?.total, 'other:', otherRes.data?.total);
      console.log('Set today total to:', total);
      setTodayTotal(total);
    } catch (error) {
      console.error('Failed to load today total:', error);
    }
  };

  const loadMonthTotal = async () => {
    try {
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`;
      
      console.log('Loading month total for userId:', userId, 'startDate:', startDate, 'endDate:', endDate);
      
      const [incomeRes, bonusRes, otherRes] = await Promise.all([
        recordService.getTotal(userId, startDate, endDate, 'income'),
        recordService.getTotal(userId, startDate, endDate, 'bonus'),
        recordService.getTotal(userId, startDate, endDate, 'other')
      ]);
      
      const total = (incomeRes.data?.total || 0) + (bonusRes.data?.total || 0) + (otherRes.data?.total || 0);
      
      console.log('Month total response - income:', incomeRes.data?.total, 'bonus:', bonusRes.data?.total, 'other:', otherRes.data?.total);
      console.log('Set month total to:', total);
      setMonthTotal(total);
    } catch (error) {
      console.error('Failed to load month total:', error);
    }
  };

  const getCategoryByType = (type: string): string => {
    const categoryMap: Record<string, string> = {
      'income': 'salary',
      'bonus': 'bonus',
      'expense': 'other',
      'other': 'other'
    };
    return categoryMap[type] || 'other';
  };

  const addRecord = async () => {
    console.log('addRecord called, form:', form);
    if (!form.amount) {
      console.log('No amount provided, returning');
      return;
    }
    console.log('Setting isAdding to true');
    setIsAdding(true);
    setError('');
    
    try {
      const selectedCat = categories.find(c => c.id === form.category);
      const amount = parseFloat(form.amount);
      const params = {
        userId,
        amount: amount,
        type: selectedCat?.type || 'income',
        category: form.category || 'general',
        description: form.source || selectedCat?.label || '新增收入'
      };
      console.log('Adding record with params:', params);
      console.log('Amount type:', typeof amount, 'Amount value:', amount);
      
      const response = await recordService.add(
        userId,
        amount,
        selectedCat?.type || 'income',
        form.category || 'general',
        form.source || selectedCat?.label || '新增收入'
      );
      
      console.log('Add record response:', response);
      console.log('Response code:', response.code);
      console.log('Response data:', response.data);
      
      if (response.code === 200 && response.data) {
        console.log('Record added successfully');
        const newRecord: IncomeRecord = {
          id: response.data._id,
          source: form.source || (selectedCat?.label || '新增收入'),
          amount: amount,
          timestamp: new Date(response.data.createTime).getTime(),
          category: form.category
        };
        console.log('New record created:', newRecord);
        setRecords([newRecord, ...records]);
        setForm({ source: '', amount: '', category: '' });
        setError('');
        
        console.log('Loading totals and records...');
        await loadTodayTotal();
        await loadMonthTotal();
        await loadRecords();
        
        console.log('Updating target current value...');
        try {
          const targetDate = `${new Date().getFullYear()}-01-01`;
          await targetService.update(userId, targetDate, amount);
          console.log('Target current value updated successfully');
        } catch (targetError) {
          console.error('Failed to update target current value:', targetError);
        }
        
        console.log('Totals and records loaded');
      } else {
        console.log('Record add failed:', response);
        setError(response.message || '添加记录失败');
      }
    } catch (error: any) {
      console.error('Failed to add record:', error);
      setError(error.message || '添加记录失败');
    } finally {
      console.log('Finally block, setting isAdding to false');
      setIsAdding(false);
    }
  };

  const deleteRecord = async (recordId: string) => {
    if (!confirm('确定要删除这条记录吗？此操作不可恢复。')) {
      return;
    }
    
    try {
      const recordToDelete = records.find(r => r.id === recordId);
      const amount = recordToDelete?.amount || 0;
      
      const response = await recordService.delete(recordId);
      if (response.code === 200) {
        setRecords(records.filter(r => r.id !== recordId));
        setSwipedRecordId(null);
        await loadTodayTotal();
        await loadMonthTotal();
        await loadRecords();
        
        console.log('Updating target current value (subtracting)...');
        try {
          const targetDate = `${new Date().getFullYear()}-01-01`;
          await targetService.update(userId, targetDate, -amount);
          console.log('Target current value updated successfully');
        } catch (targetError) {
          console.error('Failed to update target current value:', targetError);
        }
      } else {
        alert(response.message || '删除失败，请重试');
      }
    } catch (error: any) {
      console.error('Failed to delete record:', error);
      alert(error.message || '删除失败，请重试');
    }
  };

  const handleTouchStart = (e: React.TouchEvent, recordId: string) => {
    touchStartXRef.current = e.touches[0].clientX;
    recordIdRef.current = recordId;
    setSwipedRecordId(null);
  };

  const handleTouchMove = (e: React.TouchEvent, recordId: string) => {
    const currentX = e.touches[0].clientX;
    const diff = touchStartXRef.current - currentX;
    
    if (diff > 50) {
      setSwipedRecordId(recordId);
    } else if (diff < -50) {
      setSwipedRecordId(null);
    }
  };

  const handleTouchEnd = () => {
    const currentRecordId = recordIdRef.current;
    if (currentRecordId && swipedRecordId === currentRecordId) {
      setSwipedRecordId(currentRecordId);
    }
  };

  // 根据记录的分类获取图标
  const getCategoryIcon = (catId: string) => {
    return categories.find(c => c.id === catId)?.icon || '💰';
  };

  return (
    <div 
      className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
      onClick={() => swipedRecordId && setSwipedRecordId(null)}
    >
      
      {error && (
        <div className="w-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-bold">
          {error}
        </div>
      )}
      
      {/* 顶部财富看板 */}
      <div className="grid grid-cols-2 gap-4 px-1">
        <div className="glass rounded-[28px] p-5 border-l-4 border-l-wealth shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-wealth/5 rounded-full blur-xl -mr-4 -mt-4 transition-all group-hover:bg-wealth/10"></div>
          <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1">今日进账</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-xs font-bold text-wealth">￥</span>
            <span className="text-2xl font-black tracking-tighter text-slate-800 dark:text-white">
              {todayTotal.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="glass rounded-[28px] p-5 border-l-4 border-l-gold shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 rounded-full blur-xl -mr-4 -mt-4 transition-all group-hover:bg-gold/10"></div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">
              {selectedMonth === new Date().getMonth() + 1 ? '本月累计' : `${selectedMonth}月累计`}
            </p>
            <select
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-').map(Number);
                setSelectedYear(year);
                setSelectedMonth(month);
              }}
              className="text-[10px] font-bold bg-transparent border border-gold/30 rounded px-2 py-0.5 text-gold focus:outline-none focus:border-gold/60"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                const monthDate = new Date(selectedYear, month - 1);
                const isCurrentMonth = month === new Date().getMonth() + 1;
                return (
                  <option key={`month-${i}`} value={`${selectedYear}-${month}`}>
                    {isCurrentMonth ? '本月' : `${month}月`}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-xs font-bold text-gold">￥</span>
            <span className="text-2xl font-black tracking-tighter text-slate-800 dark:text-white">
              {monthTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 收入录入卡片 */}
      <div className="glass rounded-[32px] p-6 shadow-xl border border-white/10 dark:bg-zinc-900/40">
        <div className="mb-6">
          <h3 className="text-sm font-black text-slate-700 dark:text-gray-300 mb-4 flex items-center">
            <span className="w-1.5 h-4 bg-wealth rounded-full mr-2"></span>
            财富入库
          </h3>
          
          {/* 金额输入区 */}
          <div className="relative mb-6">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-wealth">￥</span>
            <input 
              type="number" 
              placeholder="0.00"
              className="w-full bg-slate-100/50 dark:bg-white/5 border-2 border-transparent focus:border-wealth/20 focus:outline-none rounded-2xl pl-12 pr-5 py-5 text-3xl font-black text-slate-800 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-700"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
            />
          </div>

          {/* 分类快捷选择 */}
          <div className="mb-2">
            <p className="text-[10px] font-bold text-gray-400 mb-2">请选择收入分类</p>
            <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm({...form, category: cat.id})}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all border ${
                    form.category === cat.id 
                      ? 'bg-white dark:bg-zinc-800 border-wealth shadow-md ring-2 ring-wealth/10 scale-105' 
                      : 'bg-slate-100/50 dark:bg-white/5 border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <span className="text-2xl mb-1">{cat.icon}</span>
                  <span className="text-[10px] font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 备注输入 */}
          <input 
            type="text" 
            placeholder="备注说明 (可选)..."
            className="w-full bg-slate-100/50 dark:bg-white/5 border border-transparent focus:border-wealth/10 focus:outline-none rounded-xl px-4 py-3 text-sm transition-all"
            value={form.source}
            onChange={e => setForm({...form, source: e.target.value})}
          />
        </div>

        <button 
          onClick={addRecord}
          disabled={!form.amount || !form.category || isAdding}
          className={`w-full font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2 ${
            !form.amount || !form.category || isAdding
              ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
              : 'bg-wealth hover:bg-emerald-600 text-white shadow-wealth/20'
          }`}
        >
          {isAdding ? (
            <span className="flex items-center space-x-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>入库中...</span>
            </span>
          ) : (
            <>
              <span>确认录入</span>
              <span className="text-xl">💰</span>
            </>
          )}
        </button>
      </div>

      {/* 流水列表 */}
      <div className="space-y-3 mt-8">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">财富足迹</h3>
          <span className="text-[10px] font-bold text-wealth bg-wealth/10 px-2 py-0.5 rounded-md">
            累计 {records.length} 笔收入
          </span>
        </div>

        {/* 分类统计 */}
        {records.length > 0 && (
          <div className="glass rounded-[24px] p-4 space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">本月分类统计</p>
            {categories.map(cat => {
              const categoryRecords = records.filter(r => r.category === cat.id);
              const categoryTotal = categoryRecords.reduce((sum, r) => sum + r.amount, 0);
              return categoryTotal > 0 ? (
                <div key={cat.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-400">{categoryRecords.length}笔</span>
                    <span className="text-sm font-black text-wealth">￥{categoryTotal.toLocaleString()}</span>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        )}
        
        {records.length === 0 ? (
          <div className="glass rounded-[28px] p-10 text-center">
            <span className="text-4xl mb-4 block opacity-20">🍃</span>
            <p className="text-xs text-gray-500 font-bold">暂无流水，快开始你的搞钱之旅吧！</p>
          </div>
        ) : (
          records.map((record, index) => (
            <div 
              key={`record-${record.id}-${index}`} 
              className="relative overflow-hidden rounded-[24px]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div 
                className={`glass rounded-[24px] p-4 flex justify-between items-center transition-transform duration-300 ${
                  swipedRecordId === record.id ? '-translate-x-16' : 'translate-x-0'
                }`}
                onTouchStart={(e) => handleTouchStart(e, record.id)}
                onTouchMove={(e) => handleTouchMove(e, record.id)}
                onTouchEnd={handleTouchEnd}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl shadow-inner">
                    {getCategoryIcon(record.category)}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-white text-sm tracking-tight">{record.source}</p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {new Date(record.timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-wealth tracking-tighter">
                    +￥{record.amount.toLocaleString()}
                  </p>
                  <div className="h-1 w-full bg-wealth/10 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-wealth w-full origin-left animate-in slide-in-from-left duration-1000"></div>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRecord(record.id);
                }}
                className={`absolute right-0 top-0 bottom-0 w-16 bg-red-500 text-white flex items-center justify-center transition-transform duration-300 ${
                  swipedRecordId === record.id ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default AccountingModule;
