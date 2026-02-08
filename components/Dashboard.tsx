
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '1月', 资产: 4000 },
  { name: '2月', 资产: 5200 },
  { name: '3月', 资产: 4800 },
  { name: '4月', 资产: 7000 },
  { name: '5月', 资产: 8500 },
  { name: '6月', 资产: 12000 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">早安，老板 💸</h2>
          <p className="text-gray-400">今天是 2024年10月24日，您的财富正在加速增长。</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold transition-colors shadow-lg shadow-emerald-500/20">
          + 记录新收入
        </button>
      </header>

      {/* 快捷统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border-l-4 border-l-emerald-500">
          <p className="text-gray-400 text-sm mb-1">本月总收入 (人民币)</p>
          <h3 className="text-3xl font-bold">￥12,450.00</h3>
          <div className="mt-2 text-emerald-400 text-xs flex items-center">
            <span>↑ 12.5% </span>
            <span className="ml-1 text-gray-500">对比上月</span>
          </div>
        </div>
        <div className="glass p-6 rounded-3xl border-l-4 border-l-amber-400">
          <p className="text-gray-400 text-sm mb-1">被动收入占比</p>
          <h3 className="text-3xl font-bold">35.2%</h3>
          <div className="mt-2 text-amber-400 text-xs flex items-center">
            <span>↑ 5.1% </span>
            <span className="ml-1 text-gray-500">逐步走向财务自由</span>
          </div>
        </div>
        <div className="glass p-6 rounded-3xl border-l-4 border-l-blue-500">
          <p className="text-gray-400 text-sm mb-1">财富目标进度</p>
          <h3 className="text-3xl font-bold">￥25万 / ￥100万</h3>
          <div className="mt-2 w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: '25%' }}></div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="glass p-6 rounded-3xl">
        <h4 className="text-xl font-bold mb-6">资产增值曲线</h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#10b981' }}
                labelStyle={{ color: '#999' }}
              />
              <Area type="monotone" dataKey="资产" stroke="#10b981" fillOpacity={1} fill="url(#colorWealth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
