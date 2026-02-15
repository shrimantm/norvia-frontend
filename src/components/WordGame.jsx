import { useState, useMemo } from "react";
import { WORD_CHALLENGES } from "../data/gamesData";

export default function WordGame({ onResult }) {
  const challenges = useMemo(() => {
    const shuffled = [...WORD_CHALLENGES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [finished, setFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const challenge = challenges[currentIdx];

  const checkAnswer = () => {
    if (showResult) return;
    let correct = false;

    if (challenge.type === "choose") {
      if (!selected) return;
      correct = selected === challenge.answer;
    } else {
      if (!userInput.trim()) return;
      correct = userInput.trim().toUpperCase() === challenge.answer.toUpperCase();
    }

    setIsCorrect(correct);
    setShowResult(true);
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
    }));
  };

  const handleNext = () => {
    if (currentIdx + 1 >= challenges.length) {
      const finalScore = score;
      const totalReward = finalScore.correct * 50 - finalScore.wrong * 20;
      setFinished(true);
      onResult({
        won: totalReward > 0,
        correct: finalScore.correct,
        wrong: finalScore.wrong,
        reward: totalReward,
        message: `${finalScore.correct} correct, ${finalScore.wrong} wrong`,
      });
    } else {
      setCurrentIdx((i) => i + 1);
      setUserInput("");
      setSelected(null);
      setShowResult(false);
      setIsCorrect(false);
      setShowHint(false);
    }
  };

  if (finished) return null;

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">
          Question {currentIdx + 1} / {challenges.length}
        </span>
        <div className="flex gap-3">
          <span className="text-primary">✓ {score.correct}</span>
          <span className="text-danger">✗ {score.wrong}</span>
        </div>
      </div>
      <div className="w-full bg-surface-light rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
          style={{ width: `${((currentIdx + 1) / challenges.length) * 100}%` }}
        />
      </div>

      {/* Challenge */}
      <div className="bg-surface-light rounded-xl p-5 border border-border">
        {/* Type badge */}
        <span className="inline-flex px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-medium mb-4">
          {challenge.type === "unscramble" ? "🔤 Unscramble" : challenge.type === "fill" ? "✏️ Fill in the Blank" : "🎯 Choose Correct"}
        </span>

        {/* Question */}
        {challenge.type === "unscramble" && (
          <div className="text-center mb-4">
            <p className="text-text-muted text-sm mb-3">Unscramble this word:</p>
            <div className="flex justify-center gap-2 mb-4">
              {challenge.scrambled.split("").map((letter, i) => (
                <span
                  key={i}
                  className="w-10 h-10 bg-primary/20 border border-primary/40 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        )}

        {challenge.type === "fill" && (
          <div className="text-center mb-4">
            <p className="text-white text-lg font-medium">{challenge.sentence}</p>
          </div>
        )}

        {challenge.type === "choose" && (
          <div className="text-center mb-4">
            <p className="text-white text-lg font-medium">{challenge.question}</p>
          </div>
        )}

        {/* Hint */}
        {!showResult && (
          <div className="text-center mb-4">
            {showHint ? (
              <p className="text-accent text-sm">💡 Hint: {challenge.hint}</p>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-text-muted text-xs hover:text-accent transition-colors cursor-pointer"
              >
                Need a hint?
              </button>
            )}
          </div>
        )}

        {/* Input Area */}
        {challenge.type === "choose" ? (
          <div className="space-y-2 max-w-md mx-auto">
            {challenge.options.map((option) => {
              let cls = "bg-surface border-border hover:border-primary/40 cursor-pointer";
              if (showResult) {
                if (option === challenge.answer) cls = "bg-primary/20 border-primary";
                else if (option === selected) cls = "bg-danger/20 border-danger";
                else cls = "bg-surface border-border opacity-50";
              } else if (option === selected) {
                cls = "bg-primary/10 border-primary";
              }
              return (
                <button
                  key={option}
                  onClick={() => !showResult && setSelected(option)}
                  className={`w-full p-3 rounded-xl border text-left text-sm text-white transition-all ${cls}`}
                >
                  {option}
                  {showResult && option === challenge.answer && <span className="float-right text-primary">✓</span>}
                  {showResult && option === selected && option !== challenge.answer && <span className="float-right text-danger">✗</span>}
                </button>
              );
            })}
          </div>
        ) : (
          !showResult && (
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                placeholder="Type your answer..."
                className="flex-1 px-4 py-3 bg-surface border border-border rounded-xl text-white text-center focus:outline-none focus:ring-2 focus:ring-primary uppercase tracking-wider"
                autoFocus
              />
            </div>
          )
        )}

        {/* Submit button */}
        {!showResult && (
          <button
            onClick={checkAnswer}
            disabled={challenge.type === "choose" ? !selected : !userInput.trim()}
            className="mt-4 w-full max-w-md mx-auto block py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Submit Answer
          </button>
        )}

        {/* Result feedback */}
        {showResult && (
          <div className={`mt-4 p-4 rounded-xl animate-fade-in ${isCorrect ? "bg-primary/10 border border-primary/30" : "bg-danger/10 border border-danger/30"}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{isCorrect ? "🎉" : "😔"}</span>
              <div>
                <p className={`font-semibold ${isCorrect ? "text-primary" : "text-danger"}`}>
                  {isCorrect ? "Correct!" : "Wrong!"}
                </p>
                <p className="text-text-muted text-sm">
                  {isCorrect
                    ? "+50 Carbon Credits"
                    : `Answer: ${challenge.answer} (-20 CC)`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next button */}
      {showResult && (
        <button
          onClick={handleNext}
          className="w-full py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer"
        >
          {currentIdx + 1 >= challenges.length ? "Finish Game" : "Next Challenge →"}
        </button>
      )}
    </div>
  );
}
