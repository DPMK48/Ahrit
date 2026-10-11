# Implementation Prompt: Adaptive HCI Learning Module Prototype

Build a functional web prototype demonstrating an adaptive, multimodal learning interface, per the three-layer architecture below. Prioritize working functionality over polish. UI must be strictly black and white — no color, no gradients, no decorative styling.

## Stack
- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)

## Architecture (three layers)

**1. Interaction/Design layer**
A single-page learning module: a short lesson (text + optional embedded video/quiz) split into 3–4 sequential steps/pages. Track every user action needed for adaptation: clicks, navigation between steps, time spent per step, and idle time.

**2. Adaptation/Engineering layer**
A rule-based engine (Express service) that reads the interaction log and adjusts the interface in real time. Implement at least these rules:
- If time-on-step exceeds a threshold (e.g. 90s) with no interaction → surface a simplified explanation or hint.
- If a user re-visits a step more than twice → flag it as "struggling" and offer a summary view.
- If a user completes steps quickly with no errors → skip optional detail and offer a "fast track" to the next section.
Log every adaptation decision (what rule fired, when, and what changed) so it can be evaluated later.

**3. Evaluation/Instrumentation layer**
- Persist all interaction events and adaptation events to MongoDB (timestamp, user/session id, event type, payload).
- Include a toggle/flag to run the module in "baseline" mode (adaptation disabled) vs "adaptive" mode, so the two can be compared later.
- Provide a simple admin/results view listing session logs and counts of adaptations triggered — this stands in for the SUS/heuristic evaluation step.

## UI requirements
- Black and white only (`#000000`, `#FFFFFF`, grays if needed for disabled states) — no gradients, no accent colors.
- Minimal, direct copy. No filler text, no marketing tone.
- Clean typography-driven layout — borders/whitespace for structure, not color blocks.
- Fully responsive is not required; a clean desktop browser layout is sufficient.

## Deliverable structure
```
/client   - React app
/server   - Express API + adaptation engine
/server/models   - Mongoose schemas (Session, Event, Adaptation)
README.md - setup instructions, how baseline vs adaptive mode is toggled
```

## Build order
1. Scaffold client + server, connect MongoDB.
2. Build the static lesson flow (steps, navigation) with event logging wired to the backend.
3. Implement the rule-based adaptation engine and connect it to live interaction events.
4. Add baseline/adaptive mode toggle.
5. Add the admin/results log view.
6. Verify end-to-end: interacting as a "struggling" user triggers visible adaptations; interacting as a "fast" user triggers the fast-track path.

Keep everything functional and testable locally (`npm run dev` for client, `npm start` for server, local MongoDB or MongoDB Atlas free tier).
