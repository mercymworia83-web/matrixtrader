'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const generateAnalysis = () => {
  const pairs = ['EUR/USD', 'GBP/JPY', 'USD/JPY', 'BTC/USD', 'ETH/USD'];
  const sentiments = ['Strong Buy', 'Buy', 'Neutral', 'Sell', 'Strong Sell'];
  
  return pairs.map(pair => {
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const confidence = Math.floor(Math.random() * 30) + 70;
    
    let color = 'text-gray-400';
    if (sentiment.includes('Buy')) color = 'text-green-400';
    if (sentiment.includes('Sell')) color = 'text-red-400';
    
    return { pair, sentiment, confidence, color };
  });
};

export default function SmartAI() {
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setAnalysis(generateAnalysis());
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-purple-400 mb-2">SMART AI Analysis</h1>
            <p className="text-gray-400">Real-time neural network market predictions.</p>
          </div>
          <Link href="/" className="text-gray-400 hover:text-white transition flex items-center gap-2">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mb-8 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-mono text-purple-300">NEURAL ENGINE: ONLINE</span>
          </div>
          <span className="text-xs text-gray-500 font-mono">LATENCY: 12ms | MODEL: v4.2.1</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-48 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysis.map((item, idx) => (
              <div key={idx} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{item.pair}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gray-900 ${item.color}`}>
                    {item.sentiment}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">AI Confidence</span>
                    <span className="text-white font-mono">{item.confidence}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-900 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        item.sentiment.includes('Buy') ? 'bg-green-500' : 
                        item.sentiment.includes('Sell') ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${item.confidence}%` }}
                    ></div>
                  </div>

                  <div className="pt-4 border-t border-gray-700 mt-4">
                    <p className="text-xs text-gray-500 mb-2">KEY DRIVERS:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] px-2 py-1 bg-gray-900 rounded text-gray-400">RSI Divergence</span>
                      <span className="text-[10px] px-2 py-1 bg-gray-900 rounded text-gray-400">Volatility Spike</span>
                    </div>
                  </div>
                </div>

                <button className="mt-6 w-full py-2 bg-gray-700 hover:bg-purple-600 rounded-lg text-sm font-medium transition">
                  View Detailed Chart →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}