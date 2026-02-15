import { useState, useMemo } from "react";
import { PATTERN_CHALLENGES } from "../data/gamesData";

export default function PatternGame({ onResult }) {
  const challenges = useMemo(() => {
    const shuffled = [...PATTERN_CHALLENGES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [finished, setFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const challenge = challenges[currentIdx];

  const checkAnswer = () => {
    if (showResult || selected === null) return;
    const correct = String(selected) === String(challenge.answer);
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
      const totalReward = finalScore.correct * 40 - finalScore.wrong * 20;
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
          Pattern {currentIdx + 1} / {challenges.length}
        </span>
        <div className="flex gap-3">
          <span className="text-primary">✓ {score.correct}</span>
          <span className="text-danger">✗ {score.wrong}</span>
        </div>
      </div>
      <div className="w-full bg-surface-light rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-secondary to-accent rounded-full transition-all"
          style={{ width: `${((currentIdx + 1) / challenges.length) * 100}%` }}
        />
      </div>

      {/* Challenge */}
      <div className="bg-surface-light rounded-xl p-5 border border-border">
        <span className="inline-flex px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium mb-4">
          {challenge.type === "number" ? "🔢 Number Pattern" : "🎨 Symbol Pattern"}
        </span>

        <p className="text-text-muted text-sm text-center mb-4">
          What comes next in the sequence?
        </p>

        {/* Sequence display */}
        <div className="flex justify-center items-center gap-2 flex-wrap mb-6">
          {challenge.sequence.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="px-4 py-3 bg-surface border border-border rounded-xl text-white font-bold text-lg min-w-[50px] text-center">
                {item}
              </span>
              {i < challenge.sequence.length - 1 && (
                <span className="text-text-muted">,</span>
              )}
            </div>
          ))}
          <span className="text-text-muted">,</span>
          <span className="px-4 py-3 bg-primary/10 border-2 border-dashed border-primary/50 rounded-xl text-primary font-bold text-lg min-w-[50px] text-center">
            ?
          </span>
        </div>

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

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {challenge.options.map((option, idx) => {
            let cls = "bg-surface border-border hover:border-secondary/60 cursor-pointer";
            if (showResult) {
              if (String(option) === String(challenge.answer)) cls = "bg-primary/20 border-primary";
              else if (String(option) === String(selected)) cls = "bg-danger/20 border-danger";
              else cls = "bg-surface border-border opacity-50";
            } else if (String(option) === String(selected)) {
              cls = "bg-secondary/10 border-secondary";
            }
            return (
              <button
                key={idx}
                onClick={() => !showResult && setSelected(option)}
                className={`p-4 rounded-xl border text-center text-white font-bold text-xl transition-all ${cls}`}
              >
                {option}
                {showResult && String(option) === String(challenge.answer) && (
                  <span className="ml-2 text-primary text-sm">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Submit */}
        {!showResult && (
          <button
            onClick={checkAnswer}
            disabled={selected === null}
            className="mt-4 w-full max-w-md mx-auto block py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Submit Answer
          </button>
        )}

        {/* Result feedback */}
        {showResult && (
          <div className={`mt-4 p-4 rounded-xl animate-fade-in ${isCorrect ? "bg-primary/10 border border-primary/30" : "bg-danger/10 border border-danger/30"}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{isCorrect ? "🧠" : "😔"}</span>
              <div>
                <p className={`font-semibold ${isCorrect ? "text-primary" : "text-danger"}`}>
                  {isCorrect ? "Correct!" : "Wrong!"}
                </p>
                <p className="text-text-muted text-sm">
                  {isCorrect
                    ? "+40 Carbon Credits"
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
          className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer"
        >
          {currentIdx + 1 >= challenges.length ? "Finish Game" : "Next Pattern →"}
        </button>
      )}
    </div>
  );
}
