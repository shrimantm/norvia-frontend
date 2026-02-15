import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { INITIAL_STOCKS, DEMO_TEAMS } from "../data/gameData";
import { apiUpdateTeam, apiGetTeams } from "../api";

const GameContext = createContext(null);

const STORAGE_KEY = "carbon-credit-game";

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

const initialState = {
  // Auth
  team: null,
  teamId: null,
  isAdmin: false,

  // Wallet
  balance: 1000,
  balanceHistory: [{ time: "Start", value: 1000 }],

  // Stocks
  stocks: INITIAL_STOCKS,
  portfolio: [], // { stockId, quantity, avgPrice }

  // Quiz
  quizScore: 0,
  answeredQuestions: [],

  // Games
  gamePenalties: [],
  totalPenalty: 0,

  // Leaderboard
  leaderboard: DEMO_TEAMS,

  // Admin quiz questions (custom)
  customQuestions: [],

  // Transaction log
  transactions: [],
};

function simulateStockPrices(stocks) {
  return stocks.map((stock) => {
    const volatility = 0.08;
    const randomChange = (Math.random() - 0.48) * volatility * stock.price;
    const newPrice = Math.max(5, Math.round((stock.price + randomChange) * 100) / 100);
    const change = Math.round((newPrice - stock.price) * 100) / 100;
    return {
      ...stock,
      price: newPrice,
      change,
      history: [...stock.history.slice(-19), newPrice],
    };
  });
}

function gameReducer(state, action) {
  switch (action.type) {
    case "LOGIN": {
      const { teamName, teamId, isAdmin, balance, quizScore } = action.payload;
      const existing = state.leaderboard.find(
        (t) => t.name.toLowerCase() === teamName.toLowerCase()
      );
      const newLeaderboard = existing
        ? state.leaderboard.map((t) =>
            t.name.toLowerCase() === teamName.toLowerCase()
              ? { ...t, balance: balance ?? t.balance, quizScore: quizScore ?? t.quizScore }
              : t
          )
        : [...state.leaderboard, { name: teamName, balance: balance ?? 1000, quizScore: quizScore ?? 0 }];
      return {
        ...state,
        team: teamName,
        teamId: teamId || null,
        isAdmin: isAdmin || false,
        balance: balance ?? state.balance,
        quizScore: quizScore ?? state.quizScore,
        leaderboard: newLeaderboard,
      };
    }

    case "LOGOUT":
      localStorage.removeItem("cc-token");
      return { ...initialState, leaderboard: state.leaderboard, customQuestions: state.customQuestions };

    case "SET_LEADERBOARD":
      return { ...state, leaderboard: action.payload };

    case "BUY_STOCK": {
      const { stockId, quantity } = action.payload;
      const stock = state.stocks.find((s) => s.id === stockId);
      if (!stock) return state;
      const cost = stock.price * quantity;
      if (cost > state.balance) return state;

      const existingIndex = state.portfolio.findIndex((p) => p.stockId === stockId);
      let newPortfolio = [...state.portfolio];
      if (existingIndex >= 0) {
        const existing = newPortfolio[existingIndex];
        const totalQty = existing.quantity + quantity;
        const avgPrice = (existing.avgPrice * existing.quantity + stock.price * quantity) / totalQty;
        newPortfolio[existingIndex] = { ...existing, quantity: totalQty, avgPrice: Math.round(avgPrice * 100) / 100 };
      } else {
        newPortfolio.push({ stockId, quantity, avgPrice: stock.price });
      }

      const newBalance = Math.round((state.balance - cost) * 100) / 100;
      const newHistory = [...state.balanceHistory, { time: `Tx${state.transactions.length + 1}`, value: newBalance }];
      return {
        ...state,
        balance: newBalance,
        portfolio: newPortfolio,
        balanceHistory: newHistory,
        transactions: [...state.transactions, { type: "BUY", stock: stock.name, quantity, amount: cost, time: new Date().toLocaleTimeString() }],
      };
    }

    case "SELL_STOCK": {
      const { stockId, quantity } = action.payload;
      const stock = state.stocks.find((s) => s.id === stockId);
      if (!stock) return state;
      const holding = state.portfolio.find((p) => p.stockId === stockId);
      if (!holding || holding.quantity < quantity) return state;

      const revenue = stock.price * quantity;
      const newQty = holding.quantity - quantity;
      let newPortfolio = state.portfolio
        .map((p) => (p.stockId === stockId ? { ...p, quantity: newQty } : p))
        .filter((p) => p.quantity > 0);

      const newBalance = Math.round((state.balance + revenue) * 100) / 100;
      const newHistory = [...state.balanceHistory, { time: `Tx${state.transactions.length + 1}`, value: newBalance }];
      return {
        ...state,
        balance: newBalance,
        portfolio: newPortfolio,
        balanceHistory: newHistory,
        transactions: [...state.transactions, { type: "SELL", stock: stock.name, quantity, amount: revenue, time: new Date().toLocaleTimeString() }],
      };
    }

    case "QUIZ_REWARD": {
      const { questionId, reward } = action.payload;
      if (state.answeredQuestions.includes(questionId)) return state;
      const newBalance = state.balance + reward;
      const newHistory = [...state.balanceHistory, { time: `Quiz`, value: newBalance }];
      return {
        ...state,
        balance: newBalance,
        quizScore: state.quizScore + reward,
        answeredQuestions: [...state.answeredQuestions, questionId],
        balanceHistory: newHistory,
        transactions: [...state.transactions, { type: "QUIZ", stock: "Quiz Reward", quantity: 1, amount: reward, time: new Date().toLocaleTimeString() }],
      };
    }

    case "QUIZ_WRONG": {
      const { questionId } = action.payload;
      if (state.answeredQuestions.includes(questionId)) return state;
      return {
        ...state,
        answeredQuestions: [...state.answeredQuestions, questionId],
      };
    }

    case "GAME_PENALTY": {
      const { game, penalty } = action.payload;
      const newBalance = Math.max(0, state.balance - penalty);
      const newHistory = [...state.balanceHistory, { time: `Game`, value: newBalance }];
      return {
        ...state,
        balance: newBalance,
        totalPenalty: state.totalPenalty + penalty,
        gamePenalties: [...state.gamePenalties, { game, penalty, time: new Date().toLocaleTimeString() }],
        balanceHistory: newHistory,
        transactions: [...state.transactions, { type: "PENALTY", stock: game, quantity: 1, amount: -penalty, time: new Date().toLocaleTimeString() }],
      };
    }

    case "GAME_REWARD": {
      const { game, reward } = action.payload;
      const newBalance = state.balance + reward;
      const newHistory = [...state.balanceHistory, { time: `Game`, value: newBalance }];
      return {
        ...state,
        balance: newBalance,
        balanceHistory: newHistory,
        transactions: [...state.transactions, { type: "GAME_WIN", stock: game, quantity: 1, amount: reward, time: new Date().toLocaleTimeString() }],
      };
    }

    case "UPDATE_STOCKS":
      return { ...state, stocks: simulateStockPrices(state.stocks) };

    case "ADMIN_SET_PRICE": {
      const { stockId, newPrice } = action.payload;
      return {
        ...state,
        stocks: state.stocks.map((s) =>
          s.id === stockId
            ? { ...s, price: newPrice, change: newPrice - s.price, history: [...s.history.slice(-19), newPrice] }
            : s
        ),
      };
    }

    case "ADMIN_ADD_QUESTION":
      return { ...state, customQuestions: [...state.customQuestions, action.payload] };

    case "UPDATE_LEADERBOARD": {
      return {
        ...state,
        leaderboard: state.leaderboard.map((t) =>
          t.name === state.team
            ? { ...t, balance: state.balance, quizScore: state.quizScore }
            : t
        ),
      };
    }

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const saved = loadState();
  const [state, dispatch] = useReducer(gameReducer, saved || initialState);

  // Persist state
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Sync balance & quizScore to backend and update local leaderboard
  useEffect(() => {
    if (state.team) {
      dispatch({ type: "UPDATE_LEADERBOARD" });
      // Sync to backend (fire-and-forget)
      if (state.teamId) {
        apiUpdateTeam(state.teamId, state.balance, state.quizScore).catch(() => {});
      }
    }
  }, [state.balance, state.quizScore]);

  // Fetch leaderboard from backend periodically
  const fetchLeaderboard = useCallback(async () => {
    try {
      const teams = await apiGetTeams();
      const mapped = teams.map((t) => ({ name: t.teamName, balance: t.balance, quizScore: t.quizScore }));
      if (mapped.length > 0) {
        dispatch({ type: "SET_LEADERBOARD", payload: mapped });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!state.team) return;
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 15000);
    return () => clearInterval(interval);
  }, [state.team, fetchLeaderboard]);

  // Stock price simulation every 10 seconds
  useEffect(() => {
    if (!state.team) return;
    const interval = setInterval(() => {
      dispatch({ type: "UPDATE_STOCKS" });
    }, 10000);
    return () => clearInterval(interval);
  }, [state.team]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
}
