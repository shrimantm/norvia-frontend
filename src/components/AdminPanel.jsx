import { useState } from "react";
import { useGame } from "../context/GameContext";

export default function AdminPanel() {
  const { state, dispatch } = useGame();

  // Stock price controls
  const [selectedStock, setSelectedStock] = useState(state.stocks[0]?.id || 1);
  const [newPrice, setNewPrice] = useState("");

  // Quiz question form
  const [qForm, setQForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: 0,
    reward: 50,
    category: "Environment",
  });

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSetPrice = () => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      showNotification("Enter a valid price!", "error");
      return;
    }
    dispatch({ type: "ADMIN_SET_PRICE", payload: { stockId: selectedStock, newPrice: price } });
    showNotification(`Stock price updated to ${price} CC`);
    setNewPrice("");
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
        {/* Stock Price Control */}
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            📈 Control Stock Prices
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Select Stock</label>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-surface-light border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {state.stocks.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.symbol} - {s.name} (Current: {s.price.toFixed(2)} CC)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">New Price (CC)</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Enter new price"
                  className="flex-1 px-4 py-3 bg-surface-light border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleSetPrice}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Stock list preview */}
            <div className="mt-4 space-y-2">
              {state.stocks.map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-surface-light rounded-xl px-4 py-3">
                  <div>
                    <span className="text-white font-medium text-sm">{s.symbol}</span>
                    <span className="text-text-muted text-xs ml-2">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-medium">{s.price.toFixed(2)} CC</span>
                    <span className={`ml-2 text-xs ${s.change >= 0 ? "text-primary" : "text-danger"}`}>
                      {s.change >= 0 ? "+" : ""}{s.change.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
