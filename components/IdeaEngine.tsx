
import React, { useState } from 'react';
import { getWealthIdeas } from '../services/geminiService';
import { WealthIdea } from '../types';

const IdeaEngine: React.FC = () => {
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<WealthIdea[]>([]);

  const handleGenerate = async () => {
    if (!skills.trim()) return;
    setLoading(true);
    try {
      const result = await getWealthIdeas(skills);
      setIdeas(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-2 gold-gradient inline-block">搞钱智库 (智能测试版)</h2>
        <p className="text-gray-400">输入你的专长或拥有的资源，让人工智能为你精准匹配最合适的赚钱路径。</p>
      </div>

      <div className="glass p-8 rounded-[40px] shadow-2xl">
        <label className="block text-sm font-medium text-gray-400 mb-2">描述你的技能、资源、空闲时间 (例如: 我会英语, 擅长写作, 每天晚上有2小时空闲)</label>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="例如: 我会编程, 有一台高性能电脑, 喜欢游戏..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !skills}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center min-w-[140px]"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              '点石成金 ✨'
            )}
          </button>
        </div>
      </div>

      {ideas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ideas.map((idea, index) => (
            <div key={index} className="glass p-6 rounded-3xl flex flex-col hover:scale-[1.02] transition-transform cursor-pointer border border-emerald-500/20">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                  idea.difficulty === '简单' ? 'bg-emerald-500/20 text-emerald-400' :
                  idea.difficulty === '中等' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  难度：{idea.difficulty}
                </span>
                <span className="text-emerald-400 font-bold">{idea.potentialMonthlyIncome}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{idea.title}</h3>
              <p className="text-sm text-gray-400 mb-6 flex-1">{idea.description}</p>
              
              <div className="space-y-2 mb-6">
                <p className="text-xs font-bold text-gray-500">启动步骤:</p>
                {idea.steps.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start space-x-2 text-xs text-gray-300">
                    <span className="text-emerald-500 font-bold">{sIdx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/5">
                查看详细商业计划
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IdeaEngine;
