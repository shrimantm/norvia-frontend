import { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import WordGame from "./WordGame";
import PatternGame from "./PatternGame";
import MazeGame from "./MazeGame";

/* ───── Games Hub Component ───── */
export default function Games() {
  const { state, dispatch } = useGame();
  const [activeGame, setActiveGame] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  // Attempt limits: max 3 per game type per session
  const MAX_ATTEMPTS = 3;
  const [attempts, setAttempts] = useState(() => {
    try {
      const saved = localStorage.getItem("cc-game-attempts");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { word: 0, pattern: 0, maze: 0 };
  });

  useEffect(() => {
    localStorage.setItem("cc-game-attempts", JSON.stringify(attempts));
  }, [attempts]);

  const games = [
    {
      id: "word",
      name: "Word Challenge",
      icon: "🔤",
      description: "Unscramble words, fill blanks & choose correct climate terms",
      rewardText: "+50 CC per correct",
      penaltyText: "-20 CC per wrong",
      color: "from-primary to-primary-dark",
    },
    {
      id: "pattern",
      name: "Pattern Recognition",
      icon: "🧩",
      description: "Find the next number, shape, or symbol in each sequence",
      rewardText: "+40 CC per correct",
      penaltyText: "-20 CC per wrong",
      color: "from-secondary to-secondary-dark",
    },
    {
      id: "maze",
      name: "Maze Navigation",
      icon: "🏔️",
      description: "Navigate through the maze and reach the exit within limited moves",
      rewardText: "+60 CC on escape",
      penaltyText: "-30 CC on failure",
      color: "from-accent to-orange-600",
    },
  ];

  const handleGameResult = (result) => {
    setGameResult(result);
    const gameDef = games.find((g) => g.id === activeGame);
    const reward = result.reward;

    if (reward > 0) {
      dispatch({ type: "GAME_REWARD", payload: { game: gameDef.name, reward } });
    } else if (reward < 0) {
      dispatch({ type: "GAME_PENALTY", payload: { game: gameDef.name, penalty: Math.abs(reward) } });
    }

    setAttempts((prev) => ({ ...prev, [activeGame]: (prev[activeGame] || 0) + 1 }));
  };

  const resetGame = () => {
    setActiveGame(null);
    setGameResult(null);
  };

  const startGame = (gameId) => {
    if (attempts[gameId] >= MAX_ATTEMPTS) return;
    setActiveGame(gameId);
    setGameResult(null);
  };

  const currentGameDef = games.find((g) => g.id === activeGame);

  const gameHistory = state.transactions.filter(
    (t) => t.type === "GAME_WIN" || t.type === "PENALTY"
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mini Games</h1>
        <p className="text-text-muted text-sm mt-1">
          Win to earn carbon credits, lose and face penalties! Credits can be used in the Stock Market.
        </p>
      </div>

      {/* Balance */}
      <div className="bg-surface rounded-xl p-4 border border-border flex items-center justify-between">
        <span className="text-text-muted text-sm">Your Balance:</span>
        <span className="text-primary font-bold text-lg">{state.balance.toFixed(0)} CC</span>
      </div>

      {!activeGame ? (
        /* Game Selection Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => {
            const used = attempts[game.id] || 0;
            const remaining = MAX_ATTEMPTS - used;
            const disabled = remaining <= 0;

            return (
              <div
                key={game.id}
                className={`bg-surface rounded-2xl border border-border overflow-hidden transition-all ${
                  disabled ? "opacity-60" : "hover:border-primary/40 group"
                }`}
              >
                <div className={`bg-gradient-to-r ${game.color} p-6 text-center`}>
                  <span className="text-5xl">{game.icon}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-white font-semibold text-lg mb-2">{game.name}</h3>
                  <p className="text-text-muted text-sm mb-4">{game.description}</p>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-primary bg-primary/10 px-2 py-1 rounded-lg">{game.rewardText}</span>
                    <span className="text-danger bg-danger/10 px-2 py-1 rounded-lg">{game.penaltyText}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-4">
                    <span className="text-text-muted">Attempts remaining:</span>
                    <span className={`font-bold ${remaining > 0 ? "text-white" : "text-danger"}`}>
                      {remaining} / {MAX_ATTEMPTS}
                    </span>
                  </div>
                  <button
                    onClick={() => startGame(game.id)}
                    disabled={disabled}
                    className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {disabled ? "No Attempts Left" : "Play Game"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Active Game */
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentGameDef.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{currentGameDef.name}</h2>
                <div className="flex gap-3 text-xs mt-1">
                  <span className="text-primary">{currentGameDef.rewardText}</span>
                  <span className="text-danger">{currentGameDef.penaltyText}</span>
                </div>
              </div>
            </div>
            {!gameResult && (
              <button
                onClick={resetGame}
                className="px-4 py-2 text-text-muted hover:text-white border border-border rounded-xl text-sm transition-colors cursor-pointer"
              >
                ← Back
              </button>
            )}
          </div>

          {/* Game Content */}
          {!gameResult && activeGame === "word" && <WordGame onResult={handleGameResult} />}
          {!gameResult && activeGame === "pattern" && <PatternGame onResult={handleGameResult} />}
          {!gameResult && activeGame === "maze" && <MazeGame onResult={handleGameResult} />}

          {/* Final Result */}
          {gameResult && (
            <div
              className={`p-6 rounded-xl animate-fade-in ${
                gameResult.won || gameResult.reward > 0
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-danger/10 border border-danger/30"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{gameResult.won || gameResult.reward > 0 ? "🏆" : "💀"}</span>
                <div>
                  <p
                    className={`text-xl font-bold ${
                      gameResult.won || gameResult.reward > 0 ? "text-primary" : "text-danger"
                    }`}
                  >
                    {gameResult.won || gameResult.reward > 0 ? "You Won!" : "You Lost!"}
                  </p>
                  <p className="text-text-muted text-sm mt-1">{gameResult.message}</p>
                  {gameResult.correct !== undefined && (
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-primary">✓ {gameResult.correct} correct</span>
                      <span className="text-danger">✗ {gameResult.wrong} wrong</span>
                    </div>
                  )}
                  <p
                    className={`text-lg font-bold mt-2 ${
                      gameResult.reward > 0 ? "text-primary" : "text-danger"
                    }`}
                  >
                    {gameResult.reward > 0 ? `+${gameResult.reward}` : `${gameResult.reward}`} Carbon Credits
                  </p>
                </div>
              </div>
              <button
                onClick={resetGame}
                className="mt-5 w-full py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Play Another Game
              </button>
            </div>
          )}
        </div>
      )}

      {/* Game History */}
      {gameHistory.length > 0 && (
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="text-white font-semibold mb-4">📋 Game History</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {[...gameHistory].reverse().map((t, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                  t.type === "GAME_WIN"
                    ? "bg-primary/5 border-primary/20"
                    : "bg-danger/5 border-danger/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{t.type === "GAME_WIN" ? "🏆" : "💀"}</span>
                  <span className="text-white text-sm">{t.stock}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-medium text-sm ${
                      t.type === "GAME_WIN" ? "text-primary" : "text-danger"
                    }`}
                  >
                    {t.type === "GAME_WIN" ? "+" : "-"}
                    {Math.abs(t.amount)} CC
                  </span>
                  <span className="text-text-muted text-xs ml-3">{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
