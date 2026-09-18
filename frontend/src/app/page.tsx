'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TradingChart from '../components/TradingChart';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(API_URL + '/binance/price?symbol=' + tradingPair);
        const data = await res.json();
        if (data.success) setCurrentPrice(data.price);
      } catch (e) { console.log('Price fetch failed'); }
    };

    const fetchBalance = async () => {
      try {
        const res = await fetch(API_URL + '/binance/balance');
        const data = await res.json();
        if (data.success && data.balances.length > 0) {
          var usdt = data.balances.find(function(b: any) { return b.asset === 'USDT'; });
          var btc = data.balances.find(function(b: any) { return b.asset === 'BTC'; });
          var text = '';
          if (usdt) text += '$' + usdt.free.toFixed(2) + ' USDT';
          if (btc) text += ' | ' + btc.free.toFixed(6) + ' BTC';
          if (!text) text = '$0.00 USDT';
          setBalance(text);
        }
      } catch (e) { console.log('Balance fetch failed'); }
    };

    const fetchOrders = async () => {
      try {
        const res = await fetch(API_URL + '/binance/orders?symbol=' + tradingPair);
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch (e) { console.log('Orders fetch failed'); }
    };

    fetchPrice();
    fetchBalance();
    fetchOrders();
    const priceInterval = setInterval(fetchPrice, 3000);
    const balanceInterval = setInterval(fetchBalance, 5000);
    const ordersInterval = setInterval(fetchOrders, 10000);
    return function cleanup() {
      clearInterval(priceInterval);
      clearInterval(balanceInterval);
      clearInterval(ordersInterval);
    };
  }, [tradingPair]);

  useEffect(function clockEffect() {
    const updateTime = function() {
      const now = new Date();
      setCurrentTime(now.toISOString().split('T')[0] + ' ' + now.toLocaleTimeString() + ' GMT');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return function cleanup() { clearInterval(timer); };
  }, []);

  const handleTrade = async function(side: string) {
    if (!isConnected) return;
    setOrderStatus('Processing...');
    try {
      const res = await fetch(API_URL + '/binance/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: tradingPair, side: side, quantity: quantity }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderStatus('Order Placed! ID: ' + data.orderId);
        setTimeout(function() { setOrderStatus(''); }, 3000);
      } else {
        setOrderStatus('Error: ' + data.message);
      }
    } catch (error) {
      setOrderStatus('Backend Connection Failed');
    }
  };

  const handleRunBot = function() {
    if (!isConnected) {
      setStatus('PLEASE CONNECT TO BINANCE FIRST');
      return;
    }
    if (isRunning) {
      setIsRunning(false);
      setStatus('BOT STOPPED');
      return;
    }
    setStatus('BOT STARTING...');
    setTimeout(function() {
      setIsRunning(true);
      setStatus('BOT RUNNING - MONITORING MARKETS');
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4 flex items-center justify-between sticky top-0 z-30">
        <h1 className="text-lg font-bold text-green-400">MATRIX TRADER</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">BALANCE</p>
            <p className="text-sm font-bold text-green-400">{balance}</p>
          </div>
          <button
            onClick={function() {
              setIsConnected(!isConnected);
              setStatus(isConnected ? 'DISCONNECTED' : 'CONNECTED TO BINANCE TESTNET');
            }}
            className={isConnected ? 'px-4 py-2 rounded-lg font-bold text-sm transition bg-red-600 hover:bg-red-700' : 'px-4 py-2 rounded-lg font-bold text-sm transition bg-green-600 hover:bg-green-700'}
          >
            {isConnected ? 'DISCONNECT' : 'CONNECT'}
          </button>
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex gap-4 overflow-x-auto scrollbar-hide whitespace-nowrap sticky top-[73px] z-20">
        {['Dashboard', 'Bot Builder', 'Free Bots', 'Quick Bot', 'SMART AI', 'Manual Trader', 'Copy Trading', 'Charts', 'Analysis Tools', 'Auto Trader', 'Signals'].map(function(item) {
          return (
            <Link key={item} href={item === 'Dashboard' ? '/' : '/' + item.toLowerCase().replace(' ', '-')} className="text-xs font-medium text-gray-300 hover:text-white transition">{item}</Link>
          );
        })}
      </nav>

      <main className="p-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Load or build your bot</h2>
              <p className="text-gray-400 text-sm">Import a bot, build from scratch, or start with a quick strategy.</p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-lg font-bold mb-3">LIVE CHART - {tradingPair}</h3>
              <TradingChart symbol={tradingPair} />
            </div>

            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 mb-1">SYSTEM STATUS:</p>
                  <p className={status.indexOf('CONNECTED') >= 0 ? 'font-mono text-sm text-green-400' : 'font-mono text-sm text-red-400'}>{status}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">TRADING PAIR:</p>
                  <select value={tradingPair} onChange={function(e) { setTradingPair(e.target.value); }} className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white">
                    <option value="BTCUSDT">BTC/USDT</option>
                    <option value="ETHUSDT">ETH/USDT</option>
                    <option value="BNBUSDT">BNB/USDT</option>
                    <option value="SOLUSDT">SOL/USDT</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                <p className="text-xs text-gray-500">Connected to Binance Testnet (Paper Trading)</p>
                <div className="text-right">
                  <p className="text-xs text-gray-400">LIVE PRICE</p>
                  <p className="text-xl font-mono font-bold text-white">{currentPrice > 0 ? '$' + currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 'Loading...'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-lg font-bold mb-3">ORDER HISTORY</h3>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-sm">No orders yet. Place your first trade!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-700 text-gray-400">
                        <th className="text-left py-2 px-2">ID</th>
                        <th className="text-left py-2 px-2">SIDE</th>
                        <th className="text-left py-2 px-2">QTY</th>
                        <th className="text-left py-2 px-2">PRICE</th>
                        <th className="text-left py-2 px-2">STATUS</th>
                        <th className="text-left py-2 px-2">TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(function(order: any) {
                        return (
                          <tr key={order.orderId} className="border-b border-gray-700/50">
                            <td className="py-2 px-2 font-mono text-gray-400">{order.orderId}</td>
                            <td className={"py-2 px-2 font-bold " + (order.side === 'BUY' ? 'text-green-400' : 'text-red-400')}>{order.side}</td>
                            <td className="py-2 px-2 font-mono">{order.executedQty}</td>
                            <td className="py-2 px-2 font-mono">{order.price > 0 ? '$' + order.price.toFixed(2) : 'Market'}</td>
                            <td className="py-2 px-2">
                              <span className={order.status === 'FILLED' ? 'text-green-400' : 'text-yellow-400'}>{order.status}</span>
                            </td>
                            <td className="py-2 px-2 text-gray-500">{order.time}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Spot Trading', icon: 'S' },
                { name: 'Futures', icon: 'F' },
                { name: 'Bot Builder', icon: 'B' },
                { name: 'AI Signals', icon: 'A' },
                { name: 'Charts', icon: 'C' },
                { name: 'Portfolio', icon: 'P' },
                { name: 'Settings', icon: 'G' },
                { name: 'Help', icon: 'H' },
              ].map(function(opt) {
                return (
                  <div key={opt.name} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 flex flex-col items-center gap-2 transition cursor-pointer active:scale-95">
                    <span className="text-2xl font-bold text-gray-500">{opt.icon}</span>
                    <span className="text-xs font-medium text-gray-300">{opt.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 h-fit sticky top-24">
            <h3 className="text-lg font-bold mb-4 text-center">MANUAL TRADE</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">PAIR</label>
                <div className="bg-gray-900 border border-gray-700 rounded p-2 text-sm font-mono">{tradingPair}</div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">QUANTITY</label>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={function(e) { setQuantity(parseFloat(e.target.value)); }}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm focus:border-green-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={function() { handleTrade('BUY'); }}
                  className="bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold text-sm transition active:scale-95"
                >
                  BUY
                </button>
                <button 
                  onClick={function() { handleTrade('SELL'); }}
                  className="bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold text-sm transition active:scale-95"
                >
                  SELL
                </button>
              </div>

              {orderStatus && (
                <div className={orderStatus.indexOf('Placed') >= 0 ? 'p-3 rounded text-xs text-center bg-green-900/30 text-green-400 border border-green-800' : 'p-3 rounded text-xs text-center bg-red-900/30 text-red-400 border border-red-800'}>
                  {orderStatus}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
        <button className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg font-semibold text-xs transition w-full md:w-auto">RISK DISCLAIMER</button>
        <div className="flex items-center gap-2 w-full md:w-auto justify-center">
          <button onClick={handleRunBot} className={(isRunning ? 'bg-red-600' : 'bg-green-600') + ' hover:opacity-90 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition'}>
            {isRunning ? 'STOP' : 'RUN BOT'}
          </button>
          <div className="bg-gray-700 px-3 py-2 rounded-lg text-xs text-gray-300 truncate max-w-[150px]">{status}</div>
        </div>
        <div className="text-[10px] text-gray-500 font-mono">{currentTime}</div>
      </div>
    </div>
  );
}