import { useState, useCallback, useEffect, useMemo } from "react";
import { MAZE_LEVELS } from "../data/gamesData";

export default function MazeGame({ onResult }) {
  const maze = useMemo(() => {
    const idx = Math.floor(Math.random() * MAZE_LEVELS.length);
    return MAZE_LEVELS[idx];
  }, []);

  // Find start position
  const startPos = useMemo(() => {
    for (let r = 0; r < maze.grid.length; r++) {
      for (let c = 0; c < maze.grid[r].length; c++) {
        if (maze.grid[r][c] === 2) return { row: r, col: c };
      }
    }
    return { row: 0, col: 0 };
  }, [maze]);

  const [playerPos, setPlayerPos] = useState(startPos);
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);
  const [trail, setTrail] = useState([`${startPos.row}-${startPos.col}`]);

  const move = useCallback(
    (dRow, dCol) => {
      if (finished) return;
      const newRow = playerPos.row + dRow;
      const newCol = playerPos.col + dCol;

      // Bounds check
      if (newRow < 0 || newRow >= maze.grid.length || newCol < 0 || newCol >= maze.grid[0].length) return;
      // Wall check
      if (maze.grid[newRow][newCol] === 1) return;

      const newMoves = moves + 1;
      setPlayerPos({ row: newRow, col: newCol });
      setMoves(newMoves);
      setTrail((prev) => [...prev, `${newRow}-${newCol}`]);

      // Check if reached exit
      if (maze.grid[newRow][newCol] === 3) {
        setFinished(true);
        onResult({
          won: true,
          reward: 60,
          message: `Escaped in ${newMoves} moves!`,
        });
        return;
      }

      // Check if out of moves
      if (newMoves >= maze.maxMoves) {
        setFinished(true);
        onResult({
          won: false,
          reward: -30,
          message: `Ran out of moves!`,
        });
      }
    },
    [playerPos, moves, finished, maze, onResult]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          move(-1, 0);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          move(1, 0);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          move(0, -1);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          move(0, 1);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  const movesLeft = maze.maxMoves - moves;
  const movesPercent = (movesLeft / maze.maxMoves) * 100;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-white font-medium">🏔️ {maze.name}</span>
        <span className={`font-bold ${movesLeft <= 5 ? "text-danger" : "text-primary"}`}>
          Moves left: {movesLeft}
        </span>
      </div>
      <div className="w-full bg-surface-light rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${movesPercent > 30 ? "bg-gradient-to-r from-primary to-secondary" : "bg-danger"}`}
          style={{ width: `${movesPercent}%` }}
        />
      </div>

      {/* Maze Grid */}
      <div className="flex justify-center">
        <div
          className="grid gap-[2px] p-3 bg-surface-light rounded-xl border border-border"
          style={{ gridTemplateColumns: `repeat(${maze.grid[0].length}, 1fr)` }}
        >
          {maze.grid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const isPlayer = playerPos.row === rIdx && playerPos.col === cIdx;
              const isStart = cell === 2;
              const isExit = cell === 3;
              const isWall = cell === 1;
              const isTrail = trail.includes(`${rIdx}-${cIdx}`);

              let cellClass = "bg-surface"; // path
              if (isWall) cellClass = "bg-gray-700";
              if (isStart) cellClass = "bg-secondary/30";
              if (isExit) cellClass = "bg-primary/30";
              if (isTrail && !isPlayer) cellClass = "bg-secondary/10";
              if (isPlayer) cellClass = "bg-primary";

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center text-sm transition-all ${cellClass}`}
                >
                  {isPlayer && "🧑"}
                  {isExit && !isPlayer && "🏁"}
                  {isStart && !isPlayer && !isTrail && "🚩"}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Controls */}
      {!finished && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-text-muted text-xs mb-1">Use arrow keys, WASD, or buttons below</p>
          <button
            onClick={() => move(-1, 0)}
            className="w-12 h-12 bg-surface-light border border-border rounded-xl text-white font-bold hover:bg-primary/20 hover:border-primary/40 transition-all cursor-pointer"
          >
            ↑
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => move(0, -1)}
              className="w-12 h-12 bg-surface-light border border-border rounded-xl text-white font-bold hover:bg-primary/20 hover:border-primary/40 transition-all cursor-pointer"
            >
              ←
            </button>
            <button
              onClick={() => move(1, 0)}
              className="w-12 h-12 bg-surface-light border border-border rounded-xl text-white font-bold hover:bg-primary/20 hover:border-primary/40 transition-all cursor-pointer"
            >
              ↓
            </button>
            <button
              onClick={() => move(0, 1)}
              className="w-12 h-12 bg-surface-light border border-border rounded-xl text-white font-bold hover:bg-primary/20 hover:border-primary/40 transition-all cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs text-text-muted">
        <span>🚩 Start</span>
        <span>🏁 Exit</span>
        <span>🧑 You</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-gray-700 rounded-sm inline-block" /> Wall
        </span>
      </div>
    </div>
  );
}
