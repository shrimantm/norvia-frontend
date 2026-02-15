import { useState, useEffect, useRef, useCallback } from "react";
import { useGame } from "../context/GameContext";

/* ───── Number Guessing Game ───── */
function NumberGuessingGame({ onResult }) {
  const [target] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState("Guess a number between 1 and 100");
  const [finished, setFinished] = useState(false);
  const maxAttempts = 7;

  const handleGuess = () => {
    const num = parseInt(guess);
    if (isNaN(num) || num < 1 || num > 100) {
      setHint("Enter a valid number (1-100)");
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (num === target) {
      setHint(`🎉 Correct! The number was ${target}`);
      setFinished(true);
      onResult({ won: true, message: `Guessed in ${newAttempts} attempts!` });
    } else if (newAttempts >= maxAttempts) {
      setHint(`💀 Out of attempts! The number was ${target}`);
      setFinished(true);
      onResult({ won: false, message: `Failed after ${maxAttempts} attempts` });
    } else {
      setHint(num < target ? "📈 Too low! Try higher" : "📉 Too high! Try lower");
    }
    setGuess("");
  };

  return (
    <div className="space-y-4">
      <p className="text-text-muted text-sm text-center">{hint}</p>
      <div className="flex items-center gap-2 justify-center">
        <span className="text-text-muted text-sm">Attempts: {attempts}/{maxAttempts}</span>
      </div>
      {!finished && (
        <div className="flex gap-3 max-w-xs mx-auto">
          <input
            type="number"
            min="1"
            max="100"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGuess()}
            placeholder="Your guess"
            className="flex-1 px-4 py-3 bg-surface-light border border-border rounded-xl text-white text-center focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <button
            onClick={handleGuess}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors cursor-pointer"
          >
            Guess
          </button>
        </div>
      )}
      {/* Progress bar */}
      <div className="max-w-xs mx-auto">
        <div className="w-full bg-surface-light rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-danger rounded-full transition-all"
            style={{ width: `${(attempts / maxAttempts) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ───── Reaction Timer Game ───── */
function ReactionTimerGame({ onResult }) {
  const [phase, setPhase] = useState("waiting"); // waiting, ready, go, done
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const timeoutRef = useRef(null);

  const startGame = useCallback(() => {
    setPhase("ready");
    const delay = 2000 + Math.random() * 3000; // 2-5s random delay
    timeoutRef.current = setTimeout(() => {
      setPhase("go");
      setStartTime(Date.now());
    }, delay);
  }, []);

  const handleClick = () => {
    if (phase === "waiting") {
      startGame();
    } else if (phase === "ready") {
      // Clicked too early!
      clearTimeout(timeoutRef.current);
      setPhase("done");
      setReactionTime(-1);
      onResult({ won: false, message: "Clicked too early!" });
    } else if (phase === "go") {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setPhase("done");
      const won = time < 500; // Under 500ms = win
      onResult({ won, message: won ? `${time}ms - Lightning fast!` : `${time}ms - Too slow!` });
    }
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const colors = {
    waiting: "bg-secondary/20 border-secondary/30",
    ready: "bg-danger/20 border-danger/30",
    go: "bg-primary/20 border-primary/30",
    done: "bg-surface-light border-border",
  };

  const texts = {
    waiting: "Click to start!",
    ready: "Wait for green...",
    go: "CLICK NOW! ⚡",
    done: reactionTime === -1 ? "Too early! 💀" : `${reactionTime}ms`,
  };

  return (
    <div className="space-y-4 text-center">
      <button
        onClick={handleClick}
        disabled={phase === "done"}
        className={`w-full max-w-sm mx-auto h-40 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${colors[phase]}`}
      >
        <span className="text-3xl font-bold text-white">{texts[phase]}</span>
        {phase === "waiting" && <span className="text-text-muted text-sm mt-2">Test your reflexes</span>}
        {phase === "done" && reactionTime > 0 && (
          <span className={`text-sm mt-2 ${reactionTime < 500 ? "text-primary" : "text-danger"}`}>
            {reactionTime < 500 ? "Win! Under 500ms" : "Fail! Over 500ms"}
          </span>
        )}
      </button>
      <p className="text-text-muted text-xs">Click when the box turns green. Under 500ms to win!</p>
    </div>
  );
}

/* ───── Memory Match Game ───── */
function MemoryMatchGame({ onResult }) {
  const emojis = ["🌱", "🌍", "♻️", "🌊", "☀️", "🍃", "💨", "🔋"];
  const [cards, setCards] = useState(() => {
    const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    return shuffled.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
  });
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);
  const maxMoves = 20;

  const handleFlip = (id) => {
    if (finished) return;
    if (flipped.length === 2) return;
    const card = cards.find((c) => c.id === id);
    if (card.flipped || card.matched) return;

    const newCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    const newFlipped = [...flipped, id];
    setCards(newCards);
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const newMoves = moves + 1;
      setMoves(newMoves);
      const [first, second] = newFlipped;
      const c1 = newCards.find((c) => c.id === first);
      const c2 = newCards.find((c) => c.id === second);

      if (c1.emoji === c2.emoji) {
        // Match!
        setTimeout(() => {
          const matched = newCards.map((c) =>
            c.id === first || c.id === second ? { ...c, matched: true } : c
          );
          setCards(matched);
          setFlipped([]);
          if (matched.every((c) => c.matched)) {
            setFinished(true);
            onResult({ won: true, message: `Matched all in ${newMoves} moves!` });
          }
        }, 300);
      } else {
        // No match
        setTimeout(() => {
          setCards(newCards.map((c) =>
            c.id === first || c.id === second ? { ...c, flipped: false } : c
          ));
          setFlipped([]);
          if (newMoves >= maxMoves) {
            setFinished(true);
            onResult({ won: false, message: `Out of moves! (${maxMoves})` });
          }
        }, 700);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">Moves: {moves}/{maxMoves}</span>
        <span className="text-text-muted">
          Matched: {cards.filter((c) => c.matched).length / 2}/{emojis.length}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all cursor-pointer ${
              card.flipped || card.matched
                ? card.matched ? "bg-primary/20 border border-primary/30" : "bg-secondary/20 border border-secondary/30"
                : "bg-surface-light border border-border hover:border-primary/30"
            }`}
          >
            {card.flipped || card.matched ? card.emoji : "?"}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───── Main Games Component ───── */
export default function Games() {
  const { state, dispatch } = useGame();
  const [activeGame, setActiveGame] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  const games = [
    {
      id: "number",
      name: "Number Guessing",
      icon: "🔢",
      description: "Guess the secret number between 1-100 in 7 attempts",
      penalty: 30,
      reward: 20,
      color: "from-primary to-primary-dark",
    },
    {
      id: "reaction",
      name: "Reaction Timer",
      icon: "⚡",
      description: "Click as fast as you can when the box turns green",
      penalty: 25,
      reward: 15,
      color: "from-secondary to-secondary-dark",
    },
    {
      id: "memory",
      name: "Memory Match",
      icon: "🧠",
      description: "Match all pairs of eco-themed cards within 20 moves",
      penalty: 40,
      reward: 30,
      color: "from-accent to-orange-600",
    },
  ];

  const handleGameResult = (result) => {
    setGameResult(result);
    const gameDef = games.find((g) => g.id === activeGame);
    if (result.won) {
      dispatch({ type: "GAME_REWARD", payload: { game: gameDef.name, reward: gameDef.reward } });
    } else {
      dispatch({ type: "GAME_PENALTY", payload: { game: gameDef.name, penalty: gameDef.penalty } });
    }
  };

  const resetGame = () => {
    setActiveGame(null);
    setGameResult(null);
  };

  const currentGameDef = games.find((g) => g.id === activeGame);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mini Games</h1>
        <p className="text-text-muted text-sm mt-1">
          Win to earn credits, lose and face penalties!
        </p>
      </div>

      {/* Balance reminder */}
      <div className="bg-surface rounded-xl p-4 border border-border flex items-center justify-between">
        <span className="text-text-muted text-sm">Your Balance:</span>
        <span className="text-primary font-bold text-lg">{state.balance.toFixed(0)} CC</span>
      </div>

      {!activeGame ? (
        /* Game Selection */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary/40 transition-all group"
            >
              <div className={`bg-gradient-to-r ${game.color} p-6 text-center`}>
                <span className="text-5xl">{game.icon}</span>
              </div>
              <div className="p-5">
                <h3 className="text-white font-semibold text-lg mb-2">{game.name}</h3>
                <p className="text-text-muted text-sm mb-4">{game.description}</p>
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className="text-primary bg-primary/10 px-2 py-1 rounded-lg">Win: +{game.reward} CC</span>
                  <span className="text-danger bg-danger/10 px-2 py-1 rounded-lg">Lose: -{game.penalty} CC</span>
                </div>
                <button
                  onClick={() => setActiveGame(game.id)}
                  className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer"
                >
                  Play Game
                </button>
              </div>
            </div>
          ))}
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
                  <span className="text-primary">Win: +{currentGameDef.reward} CC</span>
                  <span className="text-danger">Lose: -{currentGameDef.penalty} CC</span>
                </div>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="px-4 py-2 text-text-muted hover:text-white border border-border rounded-xl text-sm transition-colors cursor-pointer"
            >
              ← Back
            </button>
          </div>

          {/* Game Content */}
          {activeGame === "number" && <NumberGuessingGame onResult={handleGameResult} />}
          {activeGame === "reaction" && <ReactionTimerGame onResult={handleGameResult} />}
          {activeGame === "memory" && <MemoryMatchGame onResult={handleGameResult} />}

          {/* Result */}
          {gameResult && (
            <div className={`mt-6 p-5 rounded-xl animate-fade-in ${
              gameResult.won
                ? "bg-primary/10 border border-primary/30"
                : "bg-danger/10 border border-danger/30"
            }`}>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{gameResult.won ? "🏆" : "💀"}</span>
                <div>
                  <p className={`text-lg font-bold ${gameResult.won ? "text-primary" : "text-danger"}`}>
                    {gameResult.won ? "You Won!" : "You Lost!"}
                  </p>
                  <p className="text-text-muted text-sm">{gameResult.message}</p>
                  <p className={`text-sm font-medium mt-1 ${gameResult.won ? "text-primary" : "text-danger"}`}>
                    {gameResult.won
                      ? `+${currentGameDef.reward} Carbon Credits`
                      : `-${currentGameDef.penalty} Carbon Credits`}
                  </p>
                </div>
              </div>
              <button
                onClick={resetGame}
                className="mt-4 w-full py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Play Another Game
              </button>
            </div>
          )}
        </div>
      )}

      {/* Penalty History */}
      {state.gamePenalties.length > 0 && (
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="text-white font-semibold mb-4">📋 Game History</h3>
          <div className="space-y-2">
            {[...state.gamePenalties].reverse().map((p, i) => (
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
