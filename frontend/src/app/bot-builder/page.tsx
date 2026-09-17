'use client';

import { useState } from 'react';

export default function BotBuilder() {
  const [strategyName, setStrategyName] = useState('My First Bot');
  const [indicators, setIndicators] = useState<string[]>([]);
  const [action, setAction] = useState('BUY');
  const [status, setStatus] = useState('Ready to build');

  const toggleIndicator = (indicator: string) => {
    if (indicators.includes(indicator)) {
      setIndicators(indicators.filter(i => i !== indicator));
    } else {
      setIndicators([...indicators, indicator]);
    }
  };

  const saveBot = () => {
    setStatus('Saving bot configuration...');
    setTimeout(() => {
      setStatus(`✅ "${strategyName}" saved successfully!`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-400 mb-2">Bot Builder</h1>
            <p className="text-gray-400">Design your automated trading strategy visually.</p>
          </div>
          <a href="/" className="text-gray-400 hover:text-white transition">← Back to Dashboard</a>
        </div>

        {/* Status Bar */}
        <div className="mb-6 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <span className={`font-mono ${status.includes('✅') ? 'text-green-400' : 'text-yellow-400'}`}>
            {status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Configuration */}
          <div className="space-y-6">
            
            {/* Bot Name */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <label className="block text-sm font-medium text-gray-400 mb-2">Strategy Name</label>
              <input 
                type="text" 
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition"
              />
            </div>

            {/* Indicators Selection */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <label className="block text-sm font-medium text-gray-400 mb-4">Select Indicators</label>
              <div className="grid grid-cols-2 gap-3">
                {['RSI (14)', 'MACD', 'Bollinger Bands', 'Moving Avg (50)', 'Stochastic', 'ATR'].map((ind) => (
                  <button
                    key={ind}
                    onClick={() => toggleIndicator(ind)}
                    className={`p-3 rounded-lg text-sm font-medium transition border ${
                      indicators.includes(ind) 
                        ? 'bg-green-900/30 border-green-500 text-green-400' 
                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Selection */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <label className="block text-sm font-medium text-gray-400 mb-4">Default Action</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setAction('BUY')}
                  className={`flex-1 py-3 rounded-lg font-bold transition ${
                    action === 'BUY' ? 'bg-green-600 text-white' : 'bg-gray-900 text-gray-500'
                  }`}
                >
                  BUY / CALL
                </button>
                <button 
                  onClick={() => setAction('SELL')}
                  className={`flex-1 py-3 rounded-lg font-bold transition ${
                    action === 'SELL' ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-500'
                  }`}
                >
                  SELL / PUT
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Preview & Save */}
          <div className="space-y-6">
            
            {/* Logic Preview */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-full flex flex-col">
              <h3 className="text-lg font-bold mb-4 text-white">Strategy Logic Preview</h3>
              
              <div className="flex-1 bg-gray-900 rounded-lg p-4 font-mono text-sm space-y-2 overflow-y-auto min-h-[300px]">
                <div className="text-gray-500">// Strategy: {strategyName}</div>
                <div className="text-blue-400 mt-2">IF</div>
                {indicators.length > 0 ? (
                  indicators.map((ind, idx) => (
                    <div key={idx} className="pl-4 text-yellow-300">
                      AND {ind} is triggered
                    </div>
                  ))
                ) : (
                  <div className="pl-4 text-gray-600 italic">No indicators selected...</div>
                )}
                <div className="text-blue-400 mt-2">THEN</div>
                <div className={`pl-4 font-bold ${action === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                  EXECUTE {action}
                </div>
              </div>

              <button 
                onClick={saveBot}
                className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-green-900/20"
              >
                💾 Save Strategy
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}