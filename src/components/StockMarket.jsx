import { useState } from "react";
import { useGame } from "../context/GameContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StockMarket() {
  const { state, dispatch } = useGame();
  const [selectedStock, setSelectedStock] = useState(null);
  const [buyQty, setBuyQty] = useState(1);
  const [sellQty, setSellQty] = useState(1);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuy = (stockId) => {
    const stock = state.stocks.find((s) => s.id === stockId);
    const cost = stock.price * buyQty;
    if (cost > state.balance) {
      showNotification("Insufficient credits!", "error");
      return;
    }
    dispatch({ type: "BUY_STOCK", payload: { stockId, quantity: buyQty } });
    showNotification(`Bought ${buyQty}x ${stock.symbol} for ${cost.toFixed(0)} CC`, "success");
    setBuyQty(1);
  };

  const handleSell = (stockId) => {
    const holding = state.portfolio.find((p) => p.stockId === stockId);
    if (!holding || holding.quantity < sellQty) {
      showNotification("Not enough shares to sell!", "error");
      return;
    }
    const stock = state.stocks.find((s) => s.id === stockId);
    const revenue = stock.price * sellQty;
    dispatch({ type: "SELL_STOCK", payload: { stockId, quantity: sellQty } });
    showNotification(`Sold ${sellQty}x ${stock.symbol} for ${revenue.toFixed(0)} CC`, "success");
    setSellQty(1);
  };

  const getHolding = (stockId) => state.portfolio.find((p) => p.stockId === stockId);

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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock Market</h1>
          <p className="text-text-muted text-sm mt-1">Buy and sell carbon-friendly stocks</p>
        </div>
        <div className="bg-surface rounded-xl px-4 py-2 border border-border">
          <span className="text-text-muted text-sm">Balance: </span>
          <span className="text-primary font-bold">{state.balance.toFixed(0)} CC</span>
        </div>
      </div>

      {/* Stock Detail Modal */}
      {selectedStock && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4" onClick={() => setSelectedStock(null)}>
          <div className="bg-surface rounded-2xl p-6 max-w-lg w-full border border-border animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedStock.name}</h3>
                <p className="text-text-muted text-sm">{selectedStock.symbol} · {selectedStock.sector}</p>
              </div>
              <button onClick={() => setSelectedStock(null)} className="text-text-muted hover:text-white text-xl cursor-pointer">✕</button>
            </div>

            {/* Price Chart */}
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={selectedStock.history.map((p, i) => ({ tick: i, price: p }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="tick" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: "12px", color: "#f1f5f9" }} />
                  <Line type="monotone" dataKey="price" stroke={selectedStock.change >= 0 ? "#10b981" : "#ef4444"} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-surface-light rounded-xl p-3">
                <p className="text-text-muted text-xs">Current Price</p>
                <p className="text-white font-bold text-lg">{selectedStock.price.toFixed(2)} CC</p>
              </div>
              <div className="bg-surface-light rounded-xl p-3">
                <p className="text-text-muted text-xs">Change</p>
                <p className={`font-bold text-lg ${selectedStock.change >= 0 ? "text-primary" : "text-danger"}`}>
                  {selectedStock.change >= 0 ? "+" : ""}{selectedStock.change.toFixed(2)}
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
                    onClick={() => handleBuy(selectedStock.id)}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer"
                  >
                    Buy
                  </button>
                </div>
                <p className="text-text-muted text-xs mt-1">Cost: {(selectedStock.price * buyQty).toFixed(0)} CC</p>
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
                    onClick={() => handleSell(selectedStock.id)}
                    className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger-dark transition-colors cursor-pointer"
                  >
                    Sell
                  </button>
                </div>
                <p className="text-text-muted text-xs mt-1">
                  Owned: {getHolding(selectedStock.id)?.quantity || 0} shares
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {state.stocks.map((stock) => {
          const holding = getHolding(stock.id);
          return (
            <div
              key={stock.id}
              onClick={() => setSelectedStock(stock)}
              className="bg-surface rounded-2xl p-5 border border-border hover:border-primary/40 transition-all cursor-pointer group hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold text-sm group-hover:text-primary transition-colors">{stock.name}</h3>
                  <p className="text-text-muted text-xs">{stock.symbol} · {stock.sector}</p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  stock.change >= 0 ? "bg-primary/20 text-primary" : "bg-danger/20 text-danger"
                }`}>
                  {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.change).toFixed(2)}
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{stock.price.toFixed(2)}</p>
                  <p className="text-text-muted text-xs">CC per share</p>
                </div>
                {holding && (
                  <div className="text-right">
                    <p className="text-secondary font-medium text-sm">{holding.quantity} owned</p>
                    <p className="text-text-muted text-xs">
                      Value: {(stock.price * holding.quantity).toFixed(0)} CC
                    </p>
                  </div>
                )}
              </div>

              {/* Mini sparkline */}
              <div className="mt-3 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stock.history.map((p, i) => ({ i, p }))}>
                    <Line type="monotone" dataKey="p" stroke={stock.change >= 0 ? "#10b981" : "#ef4444"} strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* Portfolio Summary */}
      {state.portfolio.length > 0 && (
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="text-white font-semibold mb-4">📂 Your Portfolio</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-left border-b border-border">
                  <th className="pb-3 font-medium">Stock</th>
                  <th className="pb-3 font-medium">Qty</th>
                  <th className="pb-3 font-medium">Avg Price</th>
                  <th className="pb-3 font-medium">Current</th>
                  <th className="pb-3 font-medium text-right">Value</th>
                  <th className="pb-3 font-medium text-right">P&L</th>
                </tr>
              </thead>
              <tbody>
                {state.portfolio.map((p) => {
                  const stock = state.stocks.find((s) => s.id === p.stockId);
                  if (!stock) return null;
                  const value = stock.price * p.quantity;
                  const cost = p.avgPrice * p.quantity;
                  const pnl = value - cost;
                  return (
                    <tr key={p.stockId} className="border-b border-border/30 hover:bg-surface-light/50 transition-colors">
                      <td className="py-3">
                        <span className="text-white font-medium">{stock.symbol}</span>
                        <span className="text-text-muted text-xs ml-2">{stock.name}</span>
                      </td>
                      <td className="py-3 text-text-muted">{p.quantity}</td>
                      <td className="py-3 text-text-muted">{p.avgPrice.toFixed(2)}</td>
                      <td className="py-3 text-white">{stock.price.toFixed(2)}</td>
                      <td className="py-3 text-right text-white font-medium">{value.toFixed(0)} CC</td>
                      <td className={`py-3 text-right font-medium ${pnl >= 0 ? "text-primary" : "text-danger"}`}>
                        {pnl >= 0 ? "+" : ""}{pnl.toFixed(0)} CC
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
