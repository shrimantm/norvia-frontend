import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/stocks", label: "Stocks", icon: "📈" },
  { path: "/quiz", label: "Quiz", icon: "🧠" },
  { path: "/games", label: "Games", icon: "🎮" },
  { path: "/leaderboard", label: "Leaderboard", icon: "🏆" },
];

export default function Layout() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-surface border-b lg:border-b-0 lg:border-r border-border flex-shrink-0">
        <div className="p-4 lg:p-6">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">Carbon Credit</h1>
              <p className="text-text-muted text-xs">Stock Game</p>
            </div>
          </div>

          {/* Team Info */}
          <div className="bg-surface-light rounded-xl p-3 mb-6 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Team</p>
                <p className="text-white font-semibold text-sm truncate max-w-[120px]">{state.team}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted">Balance</p>
                <p className="text-primary font-bold text-sm">{state.balance.toFixed(0)} CC</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-text-muted hover:bg-surface-light hover:text-white border border-transparent"
                  }`
                }
              >
                <span>{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </NavLink>
            ))}
            {state.isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "text-text-muted hover:bg-surface-light hover:text-white border border-transparent"
                  }`
                }
              >
                <span>⚙️</span>
                <span className="hidden lg:inline">Admin</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 lg:p-6 lg:mt-auto border-t border-border/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 justify-center px-4 py-2 text-sm text-danger hover:bg-danger/10 rounded-xl transition-all cursor-pointer"
          >
            <span>🚪</span>
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
