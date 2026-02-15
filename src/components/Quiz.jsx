import { useState, useMemo } from "react";
import { useGame } from "../context/GameContext";
import { QUIZ_QUESTIONS } from "../data/gameData";

export default function Quiz() {
  const { state, dispatch } = useGame();
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Combine default + custom questions
  const allQuestions = useMemo(
    () => [...QUIZ_QUESTIONS, ...state.customQuestions],
    [state.customQuestions]
  );

  const unanswered = allQuestions.filter(
    (q) => !state.answeredQuestions.includes(q.id)
  );

  const question = unanswered[currentQ];

  const handleStartQuiz = () => {
    if (state.balance < 100) {
      alert("You need at least 100 Carbon Credits to attempt the quiz!");
      return;
    }
    dispatch({ type: "QUIZ_START" });
    setQuizStarted(true);
  };

  const handleAnswer = (optionIndex) => {
    if (showResult) return;
    setSelected(optionIndex);
    setShowResult(true);

    if (optionIndex === question.correct) {
      setFeedback({ correct: true, reward: 20, questionId: question.id });
    } else {
      setFeedback({ correct: false, reward: -10, questionId: question.id });
    }
  };

  const handleNext = () => {
    // Apply reward/penalty and mark as answered when moving to next
    if (feedback) {
      if (feedback.correct) {
        dispatch({ type: "QUIZ_REWARD", payload: { questionId: feedback.questionId } });
      } else {
        dispatch({ type: "QUIZ_WRONG", payload: { questionId: feedback.questionId } });
      }
    }
    
    setSelected(null);
    setShowResult(false);
    setFeedback(null);
    // Always reset to first question since unanswered array will be filtered
    setCurrentQ(0);
  };

  const answeredCount = state.answeredQuestions.length;
  const totalCount = allQuestions.length;
  const progress = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Quiz Challenge</h1>
        <p className="text-text-muted text-sm mt-1">Test your knowledge and earn carbon credits!</p>
      </div>

      {/* Progress */}
      <div className="bg-surface rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-muted text-sm">Progress</span>
          <span className="text-white font-medium text-sm">{answeredCount} / {totalCount} answered</span>
        </div>
        <div className="w-full bg-surface-light rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-primary font-medium text-sm">Score: {state.quizScore} CC</span>
          <span className="text-text-muted text-xs">{unanswered.length} remaining</span>
        </div>
      </div>

      {/* Entry Fee Screen */}
      {!quizStarted ? (
        <div className="bg-surface rounded-2xl p-12 border border-border text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-white mb-2">Quiz Challenge</h2>
          <p className="text-text-muted mb-6">Test your climate knowledge and earn rewards!</p>
          <div className="bg-surface-light rounded-xl p-6 mb-6 max-w-md mx-auto">
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Entry Fee:</span>
                <span className="text-danger font-bold">-100 CC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Correct Answer:</span>
                <span className="text-primary font-bold">+20 CC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Wrong Answer:</span>
                <span className="text-danger font-bold">-10 CC</span>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Total Questions:</span>
                  <span className="text-white font-bold">{unanswered.length}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleStartQuiz}
            disabled={state.balance < 100}
            className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.balance < 100 ? "Insufficient Balance" : "Start Quiz (Pay 100 CC)"}
          </button>
          <p className="text-text-muted text-sm mt-4">Your Balance: {state.balance} CC</p>
        </div>
      ) : unanswered.length === 0 ? (
        <div className="bg-surface rounded-2xl p-12 border border-border text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">All Done!</h2>
          <p className="text-text-muted">You&apos;ve answered all available questions.</p>
          <p className="text-primary font-bold text-xl mt-4">Total Quiz Score: {state.quizScore} CC</p>
        </div>
      ) : question ? (
        <div className="bg-surface rounded-2xl p-6 border border-border">
          {/* Category badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-medium">
              {question.category}
            </span>
            <span className="text-primary font-medium text-sm">+20 / -10 CC</span>
          </div>

          {/* Question Text */}
          <h2 className="text-lg font-semibold text-white mb-6">{question.question}</h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, idx) => {
              let optionClass = "bg-surface-light border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer";
              if (showResult) {
                if (idx === question.correct) {
                  optionClass = "bg-primary/20 border-primary text-primary";
                } else if (idx === selected && idx !== question.correct) {
                  optionClass = "bg-danger/20 border-danger text-danger";
                } else {
                  optionClass = "bg-surface-light border-border opacity-50";
                }
              } else if (idx === selected) {
                optionClass = "bg-primary/10 border-primary";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={showResult}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${optionClass}`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    showResult && idx === question.correct
                      ? "bg-primary text-white"
                      : showResult && idx === selected
                      ? "bg-danger text-white"
                      : "bg-surface text-text-muted"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm">{option}</span>
                  {showResult && idx === question.correct && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                  {showResult && idx === selected && idx !== question.correct && (
                    <span className="ml-auto text-danger">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`mt-6 p-4 rounded-xl animate-fade-in ${
              feedback.correct ? "bg-primary/10 border border-primary/30" : "bg-danger/10 border border-danger/30"
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{feedback.correct ? "🎉" : "😔"}</span>
                <div>
                  <p className={`font-semibold ${feedback.correct ? "text-primary" : "text-danger"}`}>
                    {feedback.correct ? "Correct!" : "Wrong Answer"}
                  </p>
                  <p className="text-text-muted text-sm">
                    {feedback.correct ? `+${feedback.reward} Carbon Credits earned!` : `${feedback.reward} Carbon Credits deducted!`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          {showResult && (
            <button
              onClick={handleNext}
              className="mt-4 w-full py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer"
            >
              Next Question →
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
