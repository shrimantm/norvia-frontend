import { useState, useEffect, useCallback } from "react";
import { useGame } from "../context/GameContext";
import { apiGetMarketData, apiBuyMarketItem, apiSellMarketItem, apiGetPortfolio } from "../api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StockMarket() {
  const { state, dispatch } = useGame();
  const [marketData, setMarketData] = useState(null);
  const [portfolio, setPortfolio] = useState({ holdings: [], summary: { totalInvested: 0, currentValue: 0, totalPnL: 0 } });
  const [selectedItem, setSelectedItem] = useState(null);
  const [buyQty, setBuyQty] = useState(1);
  const [sellQty, setSellQty] = useState(1);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("stocks");

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchMarket = useCallback(async () => {
    try {
      const data = await apiGetMarketData();
      setMarketData(data);
    } catch (err) {
      console.error("Failed to fetch market:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      const data = await apiGetPortfolio();
      setPortfolio(data);
    } catch {
      // not logged in or no portfolio
    }
  }, []);

  useEffect(() => {
    fetchMarket();
    fetchPortfolio();
    const interval = setInterval(() => {
      fetchMarket();
      fetchPortfolio();
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchMarket, fetchPortfolio]);

  const handleBuy = async (item) => {
    if (marketData.marketFrozen) {
      showNotification("Market is currently frozen by admin. Trading is temporarily disabled.", "error");
      return;
    }
    if (item.isFrozen) {
      showNotification(`${item.symbol} is frozen and cannot be traded!`, "error");
      return;
    }
    try {
      const result = await apiBuyMarketItem(item.id, buyQty);
      showNotification(result.message, "success");
      dispatch({ type: "SET_BALANCE", payload: result.newBalance });
      setBuyQty(1);
      await fetchPortfolio();
      await fetchMarket();
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleSell = async (item) => {
    if (marketData.marketFrozen) {
      showNotification("Market is currently frozen by admin. Trading is temporarily disabled.", "error");
      return;
    }
    if (item.isFrozen) {
      showNotification(`${item.symbol} is frozen and cannot be traded!`, "error");
      return;
    }
    const holding = portfolio.holdings.find((h) => h.itemId === item.id);
    if (!holding || holding.quantity < sellQty) {
      showNotification("Not enough shares to sell!", "error");
      return;
    }
    try {
      const result = await apiSellMarketItem(item.id, sellQty);
      showNotification(result.message, "success");
      dispatch({ type: "SET_BALANCE", payload: result.newBalance });
      setSellQty(1);
      await fetchPortfolio();
      await fetchMarket();
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const getHolding = (itemId) => portfolio.holdings.find((h) => h.itemId === itemId);

  if (loading || !marketData) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <div className="text-text-muted text-lg">Loading market data...</div>
      </div>
    );
  }

  const currentItems = tab === "stocks" ? marketData.stocks : marketData.commodities;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl text-white font-medium shadow-lg animate-slide-in ${
          notification.type === "success" ? "bg-primary" : "bg-danger"
        }`}>
          {notification.message}
        </div>
      )}

      {/* Active Event Banner */}
      {marketData.activeEvent && (
        <div className={`rounded-2xl p-4 border text-center font-semibold ${
          marketData.activeEvent === "crash" ? "bg-danger/10 border-danger/30 text-danger" :
          marketData.activeEvent === "recovery" ? "bg-primary/10 border-primary/30 text-primary" :
          "bg-secondary/10 border-secondary/30 text-secondary"
        }`}>
          {marketData.activeEvent === "crash" && "💥 MARKET CRASH — All prices hit by -15%!"}
          {marketData.activeEvent === "recovery" && "📈 MARKET RECOVERY — All prices boosted by +10%!"}
          {marketData.activeEvent === "boom" && "🚀 MARKET BOOM — All prices surging +20%!"}
        </div>
      )}

      {/* Market Frozen Banner */}
      {marketData.marketFrozen && (
        <div className="rounded-2xl p-4 border text-center font-semibold bg-blue-500/10 border-blue-500/30 text-blue-400">
          ❄️ MARKET FROZEN — All trading is temporarily disabled by admin
          {marketData.marketFreezeUntil && ` until ${new Date(marketData.marketFreezeUntil).toLocaleString()}`}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock & Commodity Market</h1>
          <p className="text-text-muted text-sm mt-1">
            News Round <span className="text-primary font-bold">{marketData.currentRound}</span> / {marketData.totalRounds}
            {marketData.currentRound === 0 && " — Awaiting first news release"}
            <span className="ml-3 text-xs">(All items started at 100 CC)</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-surface rounded-xl px-4 py-2 border border-border">
            <span className="text-text-muted text-sm">Balance: </span>
            <span className="text-primary font-bold">{state.balance.toFixed(0)} CC</span>
          </div>
          <div className="bg-surface rounded-xl px-4 py-2 border border-border">
            <span className="text-text-muted text-sm">P&L: </span>
            <span className={`font-bold ${portfolio.summary.totalPnL >= 0 ? "text-primary" : "text-danger"}`}>
              {portfolio.summary.totalPnL >= 0 ? "+" : ""}{portfolio.summary.totalPnL.toFixed(0)} CC
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("stocks")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
            tab === "stocks"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-surface text-text-muted border border-border hover:text-white"
          }`}
        >
          📈 Stocks ({marketData.stocks.length})
        </button>
        <button
          onClick={() => setTab("commodities")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
            tab === "commodities"
              ? "bg-secondary text-white shadow-lg shadow-secondary/20"
              : "bg-surface text-text-muted border border-border hover:text-white"
          }`}
        >
          🛢️ Commodities ({marketData.commodities.length})
        </button>
      </div>

      {/* Stock Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-surface rounded-2xl p-6 max-w-2xl w-full border border-border animate-fade-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedItem.name}
                  {selectedItem.isFrozen && <span className="ml-2 text-sm bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">🧊 FROZEN</span>}
                </h3>
                <p className="text-text-muted text-sm">{selectedItem.symbol} · {selectedItem.type === "stock" ? "Stock" : "Commodity"}</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-text-muted hover:text-white text-xl cursor-pointer">✕</button>
            </div>

            {/* Price Chart */}
            {selectedItem.priceHistory.length > 1 && (
              <div className="mb-4">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={selectedItem.priceHistory.map((p, i) => ({ round: i === 0 ? "Base" : `R${i}`, price: p }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="round" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: "12px", color: "#f1f5f9" }} />
                    <Line type="monotone" dataKey="price" stroke={selectedItem.change >= 0 ? "#10b981" : "#ef4444"} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Frozen warning */}
            {selectedItem.isFrozen && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3 mb-4 text-blue-400 text-sm font-medium">
                🧊 This item is currently frozen by admin. Trading is disabled.
              </div>
            )}

            {/* Current News */}
            <div className="bg-surface-light rounded-xl p-4 mb-4 border-l-4 border-primary">
              <p className="text-text-muted text-xs mb-1 font-medium">📰 Latest News</p>
              <p className="text-white text-sm">{selectedItem.currentNews}</p>
            </div>

            {/* News History */}
            {selectedItem.newsHistory.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-text-muted text-xs font-medium">News History</p>
                {selectedItem.newsHistory.map((nh) => (
                  <div key={nh.round} className="bg-surface-light/50 rounded-lg px-3 py-2 text-xs">
                    <span className="text-primary font-medium">Round {nh.round}:</span>{" "}
                    <span className="text-text-muted">{nh.news}</span>
                    <span className={`ml-2 font-medium ${nh.percentChange >= 0 ? "text-primary" : "text-danger"}`}>
                      {nh.percentChange >= 0 ? "+" : ""}{nh.percentChange}%
                    </span>
                    <span className="text-white ml-2">→ {nh.priceAfter.toFixed(2)} CC</span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-surface-light rounded-xl p-3">
                <p className="text-text-muted text-xs">Base Price</p>
                <p className="text-white font-bold">{selectedItem.basePrice} CC</p>
              </div>
              <div className="bg-surface-light rounded-xl p-3">
                <p className="text-text-muted text-xs">Current Price</p>
                <p className="text-white font-bold text-lg">{selectedItem.currentPrice.toFixed(2)} CC</p>
              </div>
              <div className="bg-surface-light rounded-xl p-3">
                <p className="text-text-muted text-xs">Round Change</p>
                <p className={`font-bold ${selectedItem.changePercent >= 0 ? "text-primary" : "text-danger"}`}>
                  {selectedItem.changePercent >= 0 ? "+" : ""}{selectedItem.changePercent}%
                </p>
              </div>
              <div className="bg-surface-light rounded-xl p-3">
                <p className="text-text-muted text-xs">Total Change</p>
                <p className={`font-bold ${selectedItem.totalChangePercent >= 0 ? "text-primary" : "text-danger"}`}>
                  {selectedItem.totalChangePercent >= 0 ? "+" : ""}{selectedItem.totalChangePercent}%
                </p>
              </div>
            </div>

            {/* Buy / Sell */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-text-muted text-xs block mb-1">Buy Quantity</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={buyQty}
                    onChange={(e) => setBuyQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-3 py-2 bg-surface-light border border-border rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => handleBuy(selectedItem)}
                    disabled={selectedItem.isFrozen}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      selectedItem.isFrozen
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary-dark"
                    }`}
                  >
                    Buy
                  </button>
                </div>
                <p className="text-text-muted text-xs mt-1">Cost: {(selectedItem.currentPrice * buyQty).toFixed(2)} CC</p>
              </div>
              <div>
                <label className="text-text-muted text-xs block mb-1">Sell Quantity</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={sellQty}
                    onChange={(e) => setSellQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-3 py-2 bg-surface-light border border-border rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-danger"
                  />
                  <button
                    onClick={() => handleSell(selectedItem)}
                    disabled={selectedItem.isFrozen}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      selectedItem.isFrozen
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-danger text-white hover:bg-danger-dark"
                    }`}
                  >
                    Sell
                  </button>
                </div>
                <p className="text-text-muted text-xs mt-1">
                  Owned: {getHolding(selectedItem.id)?.quantity || 0} units
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {currentItems.map((item) => {
          const holding = getHolding(item.id);
          return (
            <div
              key={item.id}
              onClick={() => { setSelectedItem(item); setBuyQty(1); setSellQty(1); }}
              className={`bg-surface rounded-2xl p-5 border transition-all cursor-pointer group hover:shadow-lg ${
                item.isFrozen
                  ? "border-blue-500/30 opacity-75 hover:border-blue-500/50 hover:shadow-blue-500/5"
                  : "border-border hover:border-primary/40 hover:shadow-primary/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm group-hover:text-primary transition-colors truncate">
                    {item.name}
                    {item.isFrozen && <span className="ml-1 text-xs text-blue-400">🧊</span>}
                  </h3>
                  <p className="text-text-muted text-xs">{item.symbol}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    item.changePercent >= 0 ? "bg-primary/20 text-primary" : "bg-danger/20 text-danger"
                  }`}>
                    {item.changePercent >= 0 ? "▲" : "▼"} {Math.abs(item.changePercent)}%
                  </div>
                </div>
              </div>

              {/* News ticker */}
              <div className="bg-surface-light rounded-lg px-3 py-2 mb-3">
                <p className="text-text-muted text-xs line-clamp-2">📰 {item.currentNews}</p>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{item.currentPrice.toFixed(2)}</p>
                  <p className="text-text-muted text-xs">CC per unit</p>
                  <p className={`text-xs font-medium mt-0.5 ${item.totalChangePercent >= 0 ? "text-primary" : "text-danger"}`}>
                    {item.totalChangePercent >= 0 ? "+" : ""}{item.totalChangePercent}% from base
                  </p>
                </div>
                {holding && (
                  <div className="text-right">
                    <p className="text-secondary font-medium text-sm">{holding.quantity} owned</p>
                    <p className={`text-xs font-medium ${holding.pnl >= 0 ? "text-primary" : "text-danger"}`}>
                      {holding.pnl >= 0 ? "+" : ""}{holding.pnl.toFixed(0)} CC
                    </p>
                  </div>
                )}
              </div>

              {/* Mini sparkline */}
              {item.priceHistory.length > 1 && (
                <div className="mt-3 h-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={item.priceHistory.map((p, i) => ({ i, p }))}>
                      <Line type="monotone" dataKey="p" stroke={item.change >= 0 ? "#10b981" : "#ef4444"} strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Portfolio Summary */}
      {portfolio.holdings.length > 0 && (
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">📂 Your Portfolio</h3>
            <div className="flex gap-4 text-sm">
              <span className="text-text-muted">Invested: <span className="text-white font-medium">{portfolio.summary.totalInvested.toFixed(0)} CC</span></span>
              <span className="text-text-muted">Value: <span className="text-white font-medium">{portfolio.summary.currentValue.toFixed(0)} CC</span></span>
              <span className="text-text-muted">P&L: <span className={`font-bold ${portfolio.summary.totalPnL >= 0 ? "text-primary" : "text-danger"}`}>
                {portfolio.summary.totalPnL >= 0 ? "+" : ""}{portfolio.summary.totalPnL.toFixed(0)} CC
              </span></span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-left border-b border-border">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Qty</th>
                  <th className="pb-3 font-medium">Avg Buy</th>
                  <th className="pb-3 font-medium">Current</th>
                  <th className="pb-3 font-medium text-right">Value</th>
                  <th className="pb-3 font-medium text-right">P&L</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((h) => (
                  <tr key={h.itemId} className="border-b border-border/30 hover:bg-surface-light/50 transition-colors">
                    <td className="py-3">
                      <span className="text-white font-medium">{h.symbol}</span>
                      <span className="text-text-muted text-xs ml-2 hidden sm:inline">{h.name}</span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${h.type === "stock" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                        {h.type}
                      </span>
                    </td>
                    <td className="py-3 text-text-muted">{h.quantity}</td>
                    <td className="py-3 text-text-muted">{h.avgBuyPrice.toFixed(2)}</td>
                    <td className="py-3 text-white">{h.currentPrice.toFixed(2)}</td>
                    <td className="py-3 text-right text-white font-medium">{h.currentValue.toFixed(0)} CC</td>
                    <td className={`py-3 text-right font-medium ${h.pnl >= 0 ? "text-primary" : "text-danger"}`}>
                      {h.pnl >= 0 ? "+" : ""}{h.pnl.toFixed(0)} CC
                      <span className="text-xs ml-1">({h.pnlPercent.toFixed(1)}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
