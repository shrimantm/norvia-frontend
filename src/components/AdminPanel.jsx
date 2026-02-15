import { useState, useEffect, useCallback } from "react";
import { useGame } from "../context/GameContext";
import { apiNextNews, apiResetMarket, apiGetMarketData, apiFreezeItem, apiAdjustPrice, apiTriggerEvent, apiFreezeMarket } from "../api";

export default function AdminPanel() {
  const { state, dispatch } = useGame();

  // Stock adjust controls
  const [selectedStock, setSelectedStock] = useState("");
  const [adjustPercent, setAdjustPercent] = useState("");
  
  // Market freeze control
  const [freezeDuration, setFreezeDuration] = useState("");

  // Quiz question form
  const [qForm, setQForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: 0,
    reward: 50,
    category: "Environment",
  });

  const [notification, setNotification] = useState(null);
  const [marketInfo, setMarketInfo] = useState(null);
  const [newsLoading, setNewsLoading] = useState(false);

  const fetchMarketInfo = useCallback(async () => {
    try {
      const data = await apiGetMarketData();
      setMarketInfo(data);
      if (!selectedStock && data.stocks.length > 0) {
        setSelectedStock(data.stocks[0].id);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchMarketInfo();
  }, [fetchMarketInfo]);

  const handleNextNews = async () => {
    setNewsLoading(true);
    try {
      const result = await apiNextNews();
      showNotification(result.message, "success");
      await fetchMarketInfo();
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setNewsLoading(false);
    }
  };

  const handleResetMarket = async () => {
    if (!window.confirm("Reset market to round 0 and clear ALL portfolios and admin overrides?")) return;
    try {
      const result = await apiResetMarket();
      showNotification(result.message, "success");
      await fetchMarketInfo();
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleFreeze = async (itemId, freeze) => {
    try {
      const result = await apiFreezeItem(itemId, freeze);
      showNotification(result.message, "success");
      await fetchMarketInfo();
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleAdjust = async () => {
    const pct = parseFloat(adjustPercent);
    if (isNaN(pct)) {
      showNotification("Enter a valid percentage!", "error");
      return;
    }
    try {
      const result = await apiAdjustPrice(selectedStock, pct);
      showNotification(result.message, "success");
      setAdjustPercent("");
      await fetchMarketInfo();
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleEvent = async (event) => {
    try {
      const result = await apiTriggerEvent(event);
      showNotification(result.message, "success");
      await fetchMarketInfo();
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleMarketFreeze = async () => {
    const duration = parseInt(freezeDuration);
    if (isNaN(duration) || duration < 0) {
      showNotification("Enter a valid duration (0 to unfreeze)!", "error");
      return;
    }
    try {
      const result = await apiFreezeMarket(duration);
      showNotification(result.message, "success");
      setFreezeDuration("");
      await fetchMarketInfo();
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!qForm.question.trim() || qForm.options.some((o) => !o.trim())) {
      showNotification("Fill in all fields!", "error");
      return;
    }
    const newQ = {
      id: `custom-${Date.now()}`,
      question: qForm.question,
      options: qForm.options,
      correct: qForm.correct,
      reward: qForm.reward,
      category: qForm.category,
    };
    dispatch({ type: "ADMIN_ADD_QUESTION", payload: newQ });
    showNotification("Quiz question added!");
    setQForm({ question: "", options: ["", "", "", ""], correct: 0, reward: 50, category: "Environment" });
  };

  if (!state.isAdmin) {
    return (
      <div className="animate-fade-in text-center py-20">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-text-muted">Login as &quot;admin&quot; to access this panel.</p>
      </div>
    );
  }

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

      <div>
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-text-muted text-sm mt-1">Manage stocks and quiz questions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── News Round Control ─── */}
        <div className="bg-surface rounded-2xl p-6 border border-border lg:col-span-2">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            📰 Market News Control
          </h3>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="bg-surface-light rounded-xl px-5 py-3 border border-border">
              <p className="text-text-muted text-xs">Current Round</p>
              <p className="text-white font-bold text-2xl">
                {marketInfo ? marketInfo.currentRound : "..."} <span className="text-text-muted text-sm font-normal">/ {marketInfo ? marketInfo.totalRounds : 4}</span>
              </p>
            </div>
            <button
              onClick={handleNextNews}
              disabled={newsLoading || (marketInfo && marketInfo.currentRound >= 4)}
              className={`px-6 py-3 rounded-xl font-medium text-white transition-all cursor-pointer ${
                marketInfo && marketInfo.currentRound >= 4
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              }`}
            >
              {newsLoading ? "Releasing..." : marketInfo && marketInfo.currentRound >= 4 ? "All Rounds Released" : `Release News Round ${(marketInfo?.currentRound || 0) + 1}`}
            </button>
            <button
              onClick={handleResetMarket}
              className="px-6 py-3 bg-danger text-white rounded-xl font-medium hover:opacity-90 transition-all cursor-pointer"
            >
              Reset Market
            </button>
          </div>
          {/* Round progress bar */}
          <div className="w-full bg-surface-light rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
              style={{ width: `${((marketInfo?.currentRound || 0) / 4) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-text-muted">
            <span>LTP</span>
            <span>Round 1</span>
            <span>Round 2</span>
            <span>Round 3</span>
            <span>Round 4</span>
          </div>
        </div>

        {/* ─── Market Events ─── */}
        <div className="bg-surface rounded-2xl p-6 border border-border lg:col-span-2">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            ⚡ Market Events
          </h3>
          <div className="flex flex-wrap gap-3 mb-3">
            <button onClick={() => handleEvent("crash")} className="px-5 py-2.5 bg-danger text-white rounded-xl font-medium hover:opacity-90 transition-all cursor-pointer">
              💥 Trigger Crash (-15%)
            </button>
            <button onClick={() => handleEvent("recovery")} className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-all cursor-pointer">
              📈 Trigger Recovery (+10%)
            </button>
            <button onClick={() => handleEvent("boom")} className="px-5 py-2.5 bg-secondary text-white rounded-xl font-medium hover:opacity-90 transition-all cursor-pointer">
              🚀 Trigger Boom (+20%)
            </button>
            <button onClick={() => handleEvent(null)} className="px-5 py-2.5 bg-surface-light text-text-muted border border-border rounded-xl font-medium hover:text-white transition-all cursor-pointer">
              ✕ Clear Event
            </button>
          </div>
          {marketInfo?.activeEvent && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
              marketInfo.activeEvent === "crash" ? "bg-danger/20 text-danger" :
              marketInfo.activeEvent === "recovery" ? "bg-primary/20 text-primary" :
              "bg-secondary/20 text-secondary"
            }`}>
              Active: {marketInfo.activeEvent.toUpperCase()} event on Round {marketInfo.eventRound}
            </div>
          )}
        </div>

        {/* ─── Freeze All Market ─── */}
        <div className="bg-surface rounded-2xl p-6 border border-border lg:col-span-2">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            ❄️ Freeze Entire Market
          </h3>
          <p className="text-text-muted text-xs mb-3">Temporarily disable all trading across the market. Set duration to 0 to unfreeze immediately.</p>
          
          {marketInfo?.marketFrozen && (
            <div className="bg-blue-500/20 text-blue-400 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
              🔒 Market is currently FROZEN{marketInfo.marketFreezeUntil && ` until ${new Date(marketInfo.marketFreezeUntil).toLocaleString()}`}
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            <input
              type="number"
              min="0"
              step="1"
              value={freezeDuration}
              onChange={(e) => setFreezeDuration(e.target.value)}
              placeholder="Duration in minutes"
              className="flex-1 min-w-[200px] px-4 py-3 bg-surface-light border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleMarketFreeze}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {marketInfo?.marketFrozen ? "Update Freeze" : "Freeze Market"}
            </button>
            {marketInfo?.marketFrozen && (
              <button
                onClick={async () => {
                  try {
                    const result = await apiFreezeMarket(0);
                    showNotification(result.message, "success");
                    setFreezeDuration("");
                    await fetchMarketInfo();
                  } catch (err) {
                    showNotification(err.message, "error");
                  }
                }}
                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors cursor-pointer"
              >
                Unfreeze Now
              </button>
            )}
          </div>
        </div>

        {/* ─── Adjust Stock % ─── */}
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            🎯 Adjust Stock/Commodity %
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Select Item</label>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="w-full px-4 py-3 bg-surface-light border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {marketInfo && [...marketInfo.stocks, ...marketInfo.commodities].map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.symbol} — {s.currentPrice.toFixed(2)} CC ({s.totalChangePercent >= 0 ? "+" : ""}{s.totalChangePercent}%)
                    {s.isFrozen ? " 🧊 FROZEN" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Extra % Adjustment</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  step="1"
                  value={adjustPercent}
                  onChange={(e) => setAdjustPercent(e.target.value)}
                  placeholder="e.g. +5 or -10"
                  className="flex-1 px-4 py-3 bg-surface-light border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleAdjust}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              <p className="text-text-muted text-xs mt-1">Adds extra percentage on top of the news-based change for the current round</p>
            </div>
          </div>
        </div>

        {/* ─── Freeze Controls ─── */}
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            🧊 Freeze / Unfreeze Items
          </h3>
          <p className="text-text-muted text-xs mb-3">Frozen items cannot be bought or sold. Click to toggle.</p>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {marketInfo && [...marketInfo.stocks, ...marketInfo.commodities].map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-surface-light rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm">{s.symbol}</span>
                  <span className="text-text-muted text-xs">{s.currentPrice.toFixed(2)} CC</span>
                  {s.isFrozen && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">FROZEN</span>}
                </div>
                <button
                  onClick={() => handleFreeze(s.id, !s.isFrozen)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    s.isFrozen
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  }`}
                >
                  {s.isFrozen ? "Unfreeze" : "Freeze"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Stock/Commodity Overview ─── */}
        <div className="bg-surface rounded-2xl p-6 border border-border lg:col-span-2">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            📊 Market Overview (All items start at 100 CC)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-left border-b border-border">
                  <th className="pb-3 font-medium">Symbol</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium text-right">Price</th>
                  <th className="pb-3 font-medium text-right">Round Chg</th>
                  <th className="pb-3 font-medium text-right">Total Chg</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {marketInfo && [...marketInfo.stocks, ...marketInfo.commodities].map((s) => (
                  <tr key={s.id} className="border-b border-border/30 hover:bg-surface-light/50 transition-colors">
                    <td className="py-2.5 text-white font-medium">{s.symbol}</td>
                    <td className="py-2.5 text-text-muted text-xs">{s.name}</td>
                    <td className="py-2.5 text-right text-white font-medium">{s.currentPrice.toFixed(2)} CC</td>
                    <td className={`py-2.5 text-right font-medium ${s.changePercent >= 0 ? "text-primary" : "text-danger"}`}>
                      {s.changePercent >= 0 ? "+" : ""}{s.changePercent}%
                    </td>
                    <td className={`py-2.5 text-right font-medium ${s.totalChangePercent >= 0 ? "text-primary" : "text-danger"}`}>
                      {s.totalChangePercent >= 0 ? "+" : ""}{s.totalChangePercent}%
                    </td>
                    <td className="py-2.5 text-center">
                      {s.isFrozen ? <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">🧊 Frozen</span>
                        : <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Active</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Quiz Question */}
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            🧠 Add Quiz Question
          </h3>
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Question</label>
              <textarea
                value={qForm.question}
                onChange={(e) => setQForm({ ...qForm, question: e.target.value })}
                rows={3}
                placeholder="Enter quiz question..."
                className="w-full px-4 py-3 bg-surface-light border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {qForm.options.map((opt, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-text-muted mb-1">
                  Option {String.fromCharCode(65 + i)} {i === qForm.correct && <span className="text-primary">(Correct)</span>}
                </label>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...qForm.options];
                    newOpts[i] = e.target.value;
                    setQForm({ ...qForm, options: newOpts });
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  className="w-full px-4 py-2 bg-surface-light border border-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Correct Answer</label>
                <select
                  value={qForm.correct}
                  onChange={(e) => setQForm({ ...qForm, correct: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-surface-light border border-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {qForm.options.map((_, i) => (
                    <option key={i} value={i}>{String.fromCharCode(65 + i)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Reward (CC)</label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={qForm.reward}
                  onChange={(e) => setQForm({ ...qForm, reward: parseInt(e.target.value) || 50 })}
                  className="w-full px-3 py-2 bg-surface-light border border-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Category</label>
                <select
                  value={qForm.category}
                  onChange={(e) => setQForm({ ...qForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-light border border-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Environment</option>
                  <option>Sustainability</option>
                  <option>Stock Market</option>
                  <option>Carbon Credits</option>
                  <option>Renewable Energy</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer"
            >
              Add Question
            </button>
          </form>

          {/* Custom questions list */}
          {state.customQuestions.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-white font-medium text-sm mb-3">Custom Questions ({state.customQuestions.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {state.customQuestions.map((q, i) => (
                  <div key={i} className="bg-surface-light rounded-xl px-4 py-3 text-sm">
                    <p className="text-white">{q.question}</p>
                    <p className="text-text-muted text-xs mt-1">{q.category} • +{q.reward} CC</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Overview */}
      <div className="bg-surface rounded-2xl p-6 border border-border">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          🏆 All Teams Overview
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-left border-b border-border">
                <th className="pb-3 font-medium">Rank</th>
                <th className="pb-3 font-medium">Team</th>
                <th className="pb-3 font-medium text-right">Balance</th>
                <th className="pb-3 font-medium text-right">Quiz Score</th>
              </tr>
            </thead>
            <tbody>
              {[...state.leaderboard]
                .sort((a, b) => b.balance - a.balance)
                .map((team, i) => (
                  <tr key={team.name} className="border-b border-border/30 hover:bg-surface-light/50 transition-colors">
                    <td className="py-3 text-text-muted">#{i + 1}</td>
                    <td className="py-3 text-white font-medium">{team.name}</td>
                    <td className="py-3 text-right text-primary font-medium">{team.balance.toFixed(0)} CC</td>
                    <td className="py-3 text-right text-purple-400">{team.quizScore} pts</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
