import { useState } from "react";
import { useGame } from "../context/GameContext";
import { apiLogin, apiRegister } from "../api";

export default function Login() {
  const { dispatch } = useGame();
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "register"

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = teamName.trim();
    if (!name) { setError("Please enter a team name"); return; }
    if (name.length < 2) { setError("Team name must be at least 2 characters"); return; }
    if (!password) { setError("Please enter a password"); return; }
    if (password.length < 4) { setError("Password must be at least 4 characters"); return; }

    setLoading(true);
    setError("");

    try {
      const data = mode === "register"
        ? await apiRegister(name, password)
        : await apiLogin(name, password);

      // Store token
      localStorage.setItem("cc-token", data.token);

      // Dispatch login to game context
      dispatch({
        type: "LOGIN",
        payload: {
          teamName: data.team.teamName,
          teamId: data.team.id,
          isAdmin: data.team.isAdmin,
          balance: data.team.balance,
          quizScore: data.team.quizScore,
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Carbon Credit</h1>
          <h2 className="text-xl text-primary font-semibold">Stock Market Game</h2>
          <p className="text-text-muted mt-2 text-sm">
            Trade stocks, solve quizzes, and grow your carbon credits!
          </p>
        </div>

        {/* Login / Register Card */}
        <div className="bg-surface rounded-2xl p-8 shadow-2xl border border-border">
          {/* Tab Toggle */}
          <div className="flex rounded-xl bg-surface-light p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                mode === "login" ? "bg-primary text-white" : "text-text-muted hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                mode === "register" ? "bg-primary text-white" : "text-text-muted hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => { setTeamName(e.target.value); setError(""); }}
                placeholder="e.g., EcoWarriors"
                className="w-full px-4 py-3 bg-surface-light border border-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Min 4 characters"
                className="w-full px-4 py-3 bg-surface-light border border-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : mode === "register" ? "Create Team 🚀" : "Login 🚀"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-text-muted text-xs text-center">
              {mode === "login"
                ? <>Don&apos;t have a team? <button onClick={() => setMode("register")} className="text-primary font-medium cursor-pointer hover:underline">Register here</button></>
                : <>Already have a team? <button onClick={() => setMode("login")} className="text-primary font-medium cursor-pointer hover:underline">Login here</button></>
              }
            </p>
            <p className="text-text-muted text-xs text-center mt-2">
              💡 Register as <span className="text-primary font-medium">&quot;admin&quot;</span> for the admin panel
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-surface/60 rounded-xl p-3 text-center border border-border/50">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-xs text-text-muted">1000 Credits</div>
          </div>
          <div className="bg-surface/60 rounded-xl p-3 text-center border border-border/50">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-xs text-text-muted">8 Stocks</div>
          </div>
          <div className="bg-surface/60 rounded-xl p-3 text-center border border-border/50">
            <div className="text-2xl mb-1">🧠</div>
            <div className="text-xs text-text-muted">15 Quizzes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
