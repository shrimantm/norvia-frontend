const API_BASE = "http://localhost:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("cc-token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiRegister(teamName, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamName, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
}

export async function apiLogin(teamName, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamName, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
}

export async function apiGetTeams() {
  const res = await fetch(`${API_BASE}/auth/teams`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch teams");
  return data;
}

export async function apiUpdateTeam(id, balance, quizScore) {
  const res = await fetch(`${API_BASE}/auth/teams/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ balance, quizScore }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update team");
  return data;
}

// ─── Market APIs ───────────────────────────────────────────

export async function apiGetMarketData() {
  const res = await fetch(`${API_BASE}/market/data`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch market data");
  return data;
}

export async function apiNextNews() {
  const res = await fetch(`${API_BASE}/market/next-news`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to advance news");
  return data;
}

export async function apiBuyMarketItem(itemId, quantity) {
  const res = await fetch(`${API_BASE}/market/buy`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ itemId, quantity }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to buy");
  return data;
}

export async function apiSellMarketItem(itemId, quantity) {
  const res = await fetch(`${API_BASE}/market/sell`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ itemId, quantity }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to sell");
  return data;
}

export async function apiGetPortfolio() {
  const res = await fetch(`${API_BASE}/market/portfolio`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch portfolio");
  return data;
}

export async function apiResetMarket() {
  const res = await fetch(`${API_BASE}/market/reset`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to reset market");
  return data;
}

// ─── Admin Market Controls ─────────────────────────────────

export async function apiFreezeItem(itemId, freeze) {
  const res = await fetch(`${API_BASE}/market/freeze`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ itemId, freeze }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update freeze status");
  return data;
}

export async function apiAdjustPrice(itemId, adjustPercent) {
  const res = await fetch(`${API_BASE}/market/adjust`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ itemId, adjustPercent }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to adjust price");
  return data;
}

export async function apiTriggerEvent(event) {
  const res = await fetch(`${API_BASE}/market/event`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ event }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to trigger event");
  return data;
}

export async function apiFreezeMarket(durationMinutes) {
  const res = await fetch(`${API_BASE}/market/freeze-market`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ durationMinutes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to freeze market");
  return data;
}

// ─── Game APIs ─────────────────────────────────────────────

export async function apiSubmitWordGame(correct, wrong) {
  const res = await fetch(`${API_BASE}/game/word`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ correct, wrong }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to submit word game");
  return data;
}

export async function apiSubmitPatternGame(correct, wrong) {
  const res = await fetch(`${API_BASE}/game/pattern`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ correct, wrong }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to submit pattern game");
  return data;
}

export async function apiSubmitMazeGame(won, moves) {
  const res = await fetch(`${API_BASE}/game/maze`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ won, moves }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to submit maze game");
  return data;
}

export async function apiGetGameAttempts() {
  const res = await fetch(`${API_BASE}/game/attempts`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch game attempts");
  return data;
}

export async function apiGetGameHistory() {
  const res = await fetch(`${API_BASE}/game/history`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch game history");
  return data;
}
