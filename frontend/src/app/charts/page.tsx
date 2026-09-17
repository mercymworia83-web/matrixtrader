'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Charts() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load TradingView Widget Script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (containerRef.current && (window as any).TradingView) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: "FX:EURUSD",
          interval: "60",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tradingview_chart",
          hide_side_toolbar: false,
          details: true,
          studies: ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Advanced Charts</h1>
          <p className="text-xs text-gray-400">Powered by TradingView • Institutional Grade</p>
        </div>
        <Link href="/" className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm">
          ← Back to Dashboard
        </Link>
      </header>

      {/* Chart Container */}
      <main className="flex-1 p-4">
        <div 
          id="tradingview_chart" 
          ref={containerRef}
          className="w-full h-[calc(100vh-100px)] rounded-xl overflow-hidden border border-gray-700 shadow-2xl"
        >
          {/* Loading State */}
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400 font-mono">Loading Professional Charts...</p>
            </div>
          </div>
        </div>
      </main>

      {/* Quick Symbol Selector */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-3 flex gap-4 overflow-x-auto">
        {['EUR/USD', 'GBP/JPY', 'USD/JPY', 'BTC/USD', 'ETH/USD', 'XAU/USD'].map((pair) => (
          <button 
            key={pair}
            className="px-4 py-2 bg-gray-700 hover:bg-blue-600 rounded-lg text-sm font-medium transition whitespace-nowrap"
          >
            {pair}
          </button>
        ))}
      </div>
    </div>
  );
}