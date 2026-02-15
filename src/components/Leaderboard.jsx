import { useGame } from "../context/GameContext";

export default function Leaderboard() {
  const { state } = useGame();

  // Sort by balance descending
  const sortedByBalance = [...state.leaderboard].sort((a, b) => b.balance - a.balance);
  const sortedByQuiz = [...state.leaderboard].sort((a, b) => b.quizScore - a.quizScore);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-text-muted text-sm mt-1">See how your team stacks up!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Leaderboard */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-5 border-b border-border">
            <h3 className="text-white font-semibold flex items-center gap-2">
              💰 Highest Carbon Credits
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {sortedByBalance.map((team, i) => (
              <div
                key={team.name}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                  team.name === state.team
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-surface-light/50 border border-transparent hover:border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl w-8 text-center">
                    {i < 3 ? medals[i] : <span className="text-text-muted text-sm font-bold">#{i + 1}</span>}
                  </span>
                  <div>
                    <p className={`font-semibold text-sm ${team.name === state.team ? "text-primary" : "text-white"}`}>
                      {team.name}
                      {team.name === state.team && (
                        <span className="ml-2 text-xs text-primary/70">(You)</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary font-bold">{team.balance.toFixed(0)} CC</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Score Leaderboard */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500/20 to-purple-500/5 p-5 border-b border-border">
            <h3 className="text-white font-semibold flex items-center gap-2">
              🧠 Best Quiz Performance
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {sortedByQuiz.map((team, i) => (
              <div
                key={team.name}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                  team.name === state.team
                    ? "bg-purple-500/10 border border-purple-500/30"
                    : "bg-surface-light/50 border border-transparent hover:border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl w-8 text-center">
                    {i < 3 ? medals[i] : <span className="text-text-muted text-sm font-bold">#{i + 1}</span>}
                  </span>
                  <div>
                    <p className={`font-semibold text-sm ${team.name === state.team ? "text-purple-400" : "text-white"}`}>
                      {team.name}
                      {team.name === state.team && (
                        <span className="ml-2 text-xs text-purple-400/70">(You)</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-purple-400 font-bold">{team.quizScore} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Your Position Summary */}
      {state.team && (
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="text-white font-semibold mb-4">📍 Your Position</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              <p className="text-text-muted text-xs mb-1">Balance Rank</p>
              <p className="text-primary font-bold text-2xl">
                #{sortedByBalance.findIndex((t) => t.name === state.team) + 1}
              </p>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-4 text-center">
              <p className="text-text-muted text-xs mb-1">Quiz Rank</p>
              <p className="text-purple-400 font-bold text-2xl">
                #{sortedByQuiz.findIndex((t) => t.name === state.team) + 1}
              </p>
            </div>
            <div className="bg-secondary/10 rounded-xl p-4 text-center">
              <p className="text-text-muted text-xs mb-1">Your Balance</p>
              <p className="text-secondary font-bold text-2xl">{state.balance.toFixed(0)}</p>
            </div>
            <div className="bg-accent/10 rounded-xl p-4 text-center">
              <p className="text-text-muted text-xs mb-1">Quiz Score</p>
              <p className="text-accent font-bold text-2xl">{state.quizScore}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
