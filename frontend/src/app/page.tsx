'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TradingChart from '../components/TradingChart';

// HARDCODED PRODUCTION URL - NO MORE GUESSWORK
const API_URL = 'https://matrixtrader-backend.onrender.com';

export default function Dashboard() {
  const [balance, setBalance] = useState('Loading...');
  const [status, setStatus] = useState('CONNECTED TO BINANCE TESTNET');
  const [currentTime, setCurrentTime] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [tradingPair, setTradingPair] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [quantity, setQuantity] = useState(0.001);
  const [orderStatus, setOrderStatus] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [backendWakingUp, setBackendWakingUp] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Wake up backend & fetch initial data
  const initializeData = async () => {
    setBackendWakingUp(true);
    setStatus('WAKING UP BACKEND...');
    setIsConnected(false);
    
    try {
      console.log('🚀 Attempting to connect to:', API_URL);
      
      // 1. WAKE UP RENDER (Free tier spins down)
      await fetch(`${API_URL}/binance/price?symbol=BTCUSDT`, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(120000) // 2 min timeout
      }).catch(() => console.log('Backend still waking up...'));

      // Small delay to ensure server is fully ready after wake-up
      await new Promise(r => setTimeout(r, 2000));

      // 2. FETCH LIVE PRICE
      const priceRes = await fetch(`${API_URL}/binance/price?symbol=${tradingPair}`);
      if (priceRes.ok) {
        const data = await priceRes.json();
        console.log('✅ Price received:', data);
        setCurrentPrice(data.price || 0);
        setIsConnected(true);
        setStatus('CONNECTED TO BINANCE TESTNET');
      } else {
        throw new Error('Price fetch failed');
      }

      // 3. FETCH BALANCE
      const balanceRes = await fetch(`${API_URL}/binance/balance`);
      if (balanceRes.ok) {
        const data = await balanceRes.json();
        // Find USDT balance
        const usdt = data.balance?.balances?.find((b: any) => b.asset === 'USDT');
        setBalance(usdt ? `${parseFloat(usdt.free).toFixed(2)} USDT` : '0.00 USDT');
      }

      // 4. FETCH ORDERS
      const ordersRes = await fetch(`${API_URL}/binance/orders`);
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      }

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      setBalance('Connection Timeout');
      setStatus('BACKEND UNREACHABLE');
      setIsConnected(false);
    } finally {
      setBackendWakingUp(false);
    }
  };

  // Run on mount and when trading pair changes
  useEffect(() => {
    initializeData();
  }, [tradingPair]);

  const handleBuy = async () => {
    setOrderStatus('Processing Buy...');
    try {
      const res = await fetch(`${API_URL}/binance/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: tradingPair, side: 'BUY', quantity })
      });
      const data = await res.json();
      setOrderStatus(data.message || 'Buy Order Placed');
      // Refresh balance after order
      initializeData();
    } catch (err) {
      setOrderStatus('Buy Failed: Backend Unreachable');
    }
  };

  const handleSell = async () => {
    setOrderStatus('Processing Sell...');
    try {
      const res = await fetch(`${API_URL}/binance/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: tradingPair, side: 'SELL', quantity })
      });
      const data = await res.json();
      setOrderStatus(data.message || 'Sell Order Placed');
      // Refresh balance after order
      initializeData();
    } catch (err) {
      setOrderStatus('Sell Failed: Backend Unreachable');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#1e2329]">
        <h1 className="text-2xl font-bold text-[#fcd535] tracking-wider">MATRIX TRADER</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">BALANCE</p>
            <p className={`font-mono ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              {backendWakingUp ? 'Waking...' : balance}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-bold"
          >
            DISCONNECT
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex gap-6 px-6 py-3 text-sm text-gray-400 border-b border-gray-800 overflow-x-auto">
        {['Dashboard', 'Bot Builder', 'Free Bots', 'Quick Bot', 'SMART AI', 'Manual Trader', 'Copy Trading', 'Charts', 'Analysis Tools', 'Auto Trader', 'Signals'].map((item) => (
          <Link key={item} href="#" className="hover:text-white whitespace-nowrap transition-colors">
            {item}
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">Load or build your bot</h2>
        <p className="text-gray-400 mb-8">Import a bot, build from scratch, or start with a quick strategy.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Chart & Status */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Chart Container */}
            <div className="bg-[#1e2329] rounded-lg p-4 border border-gray-800 shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                LIVE CHART - {tradingPair}
              </h3>
              <div className="h-[400px] w-full bg-black rounded overflow-hidden relative">
                 <TradingChart symbol={tradingPair} />
              </div>
            </div>

            {/* System Status Panel */}
            <div className="bg-[#1e2329] rounded-lg p-6 border border-gray-800 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">System Status</p>
                <p className={`font-bold ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                  {status}
                </p>
                <p className="text-xs text-gray-400 mt-1">Connected to Binance Testnet (Paper Trading)</p>
                
                {/* RETRY BUTTON FOR WHEN RENDER IS SLEEPING */}
                {!isConnected && !backendWakingUp && (
                  <button 
                    onClick={initializeData}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                  >
                    Retry Connection
                  </button>
                )}
              </div>
              
              <div className="text-right">
                <div className="mb-4">
                   <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Trading Pair</p>
                   <select 
                    value={tradingPair} 
                    onChange={(e) => setTradingPair(e.target.value)}
                    className="bg-[#2b3139] border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-yellow-500"
                   >
                     <option value="BTCUSDT">BTC/USDT</option>
                     <option value="ETHUSDT">ETH/USDT</option>
                     <option value="SOLUSDT">SOL/USDT</option>
                   </select>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Live Price</p>
                  <p className="text-2xl font-mono font-bold">
                    {backendWakingUp ? 'Waking...' : currentPrice > 0 ? `$${currentPrice.toLocaleString()}` : 'Loading...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Order History Placeholder */}
            <div className="bg-[#1e2329] rounded-lg p-6 border border-gray-800 min-h-[200px]">
              <h3 className="text-lg font-bold mb-4">ORDER HISTORY</h3>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No orders yet. Place your first trade!</p>
              ) : (
                <ul className="space-y-2">
                  {orders.map((order, idx) => (
                    <li key={idx} className="flex justify-between text-sm border-b border-gray-800 pb-2">
                      <span>{order.side} {order.symbol}</span>
                      <span className="text-gray-400">{order.qty} @ {order.price}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          {/* Right Column: Manual Trade */}
          <div className="bg-[#1e2329] rounded-lg p-6 border border-gray-800 h-fit sticky top-6">
            <h3 className="text-xl font-bold mb-6 text-center">MANUAL TRADE</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase">Pair</label>
                <input 
                  type="text" 
                  value={tradingPair} 
                  readOnly 
                  className="w-full bg-[#2b3139] border border-gray-700 rounded p-3 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase">Quantity</label>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(parseFloat(e.target.value))}
                  className="w-full bg-[#2b3139] border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={handleBuy}
                  disabled={backendWakingUp || !isConnected}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded transition-all active:scale-95"
                >
                  BUY
                </button>
                <button 
                  onClick={handleSell}
                  disabled={backendWakingUp || !isConnected}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded transition-all active:scale-95"
                >
                  SELL
                </button>
              </div>

              {orderStatus && (
                <div className={`mt-4 p-3 rounded text-center text-sm font-medium ${orderStatus.includes('Failed') ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                  {orderStatus}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer Controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#1e2329] border-t border-gray-800 p-4 flex justify-between items-center px-8 z-50">
        <button className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-6 py-2 rounded text-sm">
          RISK DISCLAIMER
        </button>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-2 rounded font-bold transition-all ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isRunning ? 'STOP BOT' : 'RUN BOT'}
          </button>
          <div className="bg-[#2b3139] px-4 py-2 rounded text-sm text-gray-300 flex items-center">
             CONNECTED TO BI...
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          {currentTime} GMT
        </div>
      </footer>
    </div>
  );
}