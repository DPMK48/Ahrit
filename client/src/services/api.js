const API_BASE = '/api';

export async function createSession(mode = 'adaptive') {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode,
      metadata: {
        userAgent: navigator.userAgent,
        screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      },
    }),
  });
  return res.json();
}

export async function getSession(sessionId) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
  return res.json();
}

export async function toggleSessionMode(sessionId, mode) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/mode`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  return res.json();
}

export async function updateSessionStep(sessionId, stepIndex, completed = false) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/step`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stepIndex, completed }),
  });
  return res.json();
}

export async function logEvent(eventData) {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  return res.json();
}

export async function getAdaptations(sessionId) {
  const res = await fetch(`${API_BASE}/adaptations/session/${sessionId}`);
  return res.json();
}

export async function updateAdaptationStatus(adaptationId, status) {
  const res = await fetch(`${API_BASE}/adaptations/${adaptationId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function getAdminMetrics() {
  const res = await fetch(`${API_BASE}/admin/metrics`);
  return res.json();
}

export async function getAdminSessions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/sessions?${query}`);
  return res.json();
}

export async function getAdminSessionTrace(sessionId) {
  const res = await fetch(`${API_BASE}/admin/sessions/${sessionId}/trace`);
  return res.json();
}
