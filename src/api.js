const API_BASE = "http://localhost:5000/api";

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
