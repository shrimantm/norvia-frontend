import { useGame } from "../context/GameContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export default function Dashboard() {
  const { state } = useGame();

  const portfolioValue = state.portfolio.reduce((sum, p) => {
    const stock = state.stocks.find((s) => s.id === p.stockId);
    return sum + (stock ? stock.price * p.quantity : 0);
  }, 0);

  const totalWealth = state.balance + portfolioValue;

  const pieData = state.portfolio.map((p) => {
    const stock = state.stocks.find((s) => s.id === p.stockId);
    return { name: stock?.symbol || "?", value: Math.round(stock ? stock.price * p.quantity : 0) };
  });

  if (pieData.length === 0) {
    pieData.push({ name: "Cash", value: state.balance });
  }

  const stats = [
    { label: "Carbon Credits", value: state.balance.toFixed(0), icon: "💰", color: "text-primary", bg: "bg-primary/10" },
    { label: "Portfolio Value", value: portfolioValue.toFixed(0), icon: "📈", color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Total Wealth", value: totalWealth.toFixed(0), icon: "🏦", color: "text-accent", bg: "bg-accent/10" },
    { label: "Quiz Score", value: state.quizScore, icon: "🧠", color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Stocks Owned", value: state.portfolio.length, icon: "📊", color: "text-pink-400", bg: "bg-pink-400/10" },
    { label: "Penalties", value: state.totalPenalty, icon: "⚠️", color: "text-danger", bg: "bg-danger/10" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Welcome back, <span className="text-primary font-medium">{state.team}</span>!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4 border border-border/50 animate-slide-in`} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-text-muted text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Over Time */}
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="text-white font-semibold mb-4">💰 Credit Balance Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={state.balanceHistory}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: "12px", color: "#f1f5f9" }}
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio Pie */}
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="text-white font-semibold mb-4">📊 Portfolio Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #475569", borderRadius: "12px", color: "#f1f5f9" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-text-muted text-xs">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-surface rounded-2xl p-6 border border-border">
        <h3 className="text-white font-semibold mb-4">📜 Recent Transactions</h3>
        {state.transactions.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-8">No transactions yet. Start trading!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-left border-b border-border">
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Detail</th>
                  <th className="pb-3 font-medium">Qty</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {[...state.transactions].reverse().slice(0, 10).map((tx, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-surface-light/50 transition-colors">
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === "BUY" ? "bg-secondary/20 text-secondary" :
                        tx.type === "SELL" ? "bg-primary/20 text-primary" :
                        tx.type === "QUIZ" ? "bg-purple-400/20 text-purple-400" :
                        tx.type === "GAME_WIN" ? "bg-accent/20 text-accent" :
                        "bg-danger/20 text-danger"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 text-white">{tx.stock}</td>
                    <td className="py-3 text-text-muted">{tx.quantity}</td>
                    <td className={`py-3 text-right font-medium ${tx.amount >= 0 ? "text-primary" : "text-danger"}`}>
                      {tx.amount >= 0 ? "+" : ""}{tx.amount.toFixed(0)} CC
                    </td>
                    <td className="py-3 text-right text-text-muted text-xs">{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Penalty History */}
      {state.gamePenalties.length > 0 && (
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="text-white font-semibold mb-4">⚠️ Game Penalty History</h3>
          <div className="space-y-2">
            {state.gamePenalties.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-danger/5 rounded-xl px-4 py-3 border border-danger/20">
                <div className="flex items-center gap-3">
                  <span className="text-danger">🎮</span>
                  <span className="text-white text-sm">{p.game}</span>
                </div>
                <div className="text-right">
                  <span className="text-danger font-medium text-sm">-{p.penalty} CC</span>
                  <span className="text-text-muted text-xs ml-3">{p.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
