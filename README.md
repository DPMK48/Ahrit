# Adaptive HCI Learning Module Prototype

A research prototype demonstrating an **adaptive, multimodal learning interface** built upon Donald Norman's conceptual frameworks, Fitts's Law biomechanical modeling, and cognitive gulf analysis.

The system is strictly styled in **black and white** (`#000000`, `#FFFFFF`, neutral grays) without colors, gradients, or decorative flourishes, adhering to empirical minimalist design principles.

---

## Architecture Overview (Three Layers)

```
Ahrit's Project/
├── client/                     # Layer 1: React + Vite Single-Page Application
│   ├── src/
│   │   ├── components/         # Steps 1–4, Adaptive Overlays, Header, Admin Dashboard
│   │   ├── services/           # API and Interaction Tracker
│   │   ├── index.css           # Strict Black & White typography design system
│   │   └── App.jsx             # State orchestration & real-time adaptation listener
├── server/                     # Layer 2 & 3: Express API + Rule Engine + Storage
│   ├── models/                 # Mongoose Schemas (Session, Event, Adaptation)
│   ├── engine/                 # Rule-based Engine & adaptive payloads
│   ├── routes/                 # REST endpoints for sessions, telemetry, adaptations, admin
│   ├── db.js                   # MongoDB connection with zero-friction in-memory fallback
│   └── server.js               # Express application entrypoint
└── README.md                   # Setup and usage documentation
```

### 1. Interaction & Design Layer (`/client`)
A 4-step interactive curriculum:
- **Step 1: Mental Models & Conceptual Architecture:** Reading material + diagnostic check on Design Model vs User Model vs System Image.
- **Step 2: Fitts's Law & Motor Movement Dynamics:** Live interactive target acquisition micro-experiment calculating Index of Difficulty ($ID$) and Movement Time ($MT$) + formula quiz.
- **Step 3: Gulf of Execution & Gulf of Evaluation:** Scenario analysis on cognitive breakdowns and state evaluation.
- **Step 4: Synthesis & Learning Summary:** Session analytics breakdown and module finalization.

### 2. Adaptation & Engineering Layer (`/server/engine`)
A rule-based Express engine evaluating telemetry in real-time:
- **Rule 1 (Idle Inactivity / Cognitive Overload):** If the user is inactive on a step without interaction for $\ge 20\text{s}$, the system injects a context-specific **Hint / Simplified Explanation**.
- **Rule 2 (Re-visit / Struggling Detection):** If a user revisits a step more than twice ($> 2$ visits) or fails diagnostic quizzes, the system flags the user as "struggling" and offers a structured **Summary View**.
- **Rule 3 (High Proficiency / Fast Track):** If a user completes preceding steps rapidly with $0$ errors, the system unlocks a **Fast Track** opportunity to skip intermediate details directly to the final synthesis step.
- Every adaptation decision is permanently logged with timestamp, rule ID, trigger condition, and user action.

### 3. Evaluation & Instrumentation Layer (`/server/models` + Admin Dashboard)
- **MongoDB Models:**
  - `Session`: Tracks session ID, mode (`baseline` vs `adaptive`), current step, duration, and aggregated metrics.
  - `Event`: Ingests every click, navigation jump, revisit, idle timeout, quiz answer, and trial acquisition.
  - `Adaptation`: Logs every rule evaluation decision, rationale, and whether the user accepted or dismissed it.
- **Admin & Results Dashboard:**
  - Stands in for SUS / heuristic evaluation.
  - Compares average completion duration and event density between **Baseline** and **Adaptive** modes.
  - Inspects granular session event streams and adaptation timelines.
  - Provides a one-click **JSON Data Export** for downstream statistical analysis.

---

## How Baseline vs. Adaptive Mode Works

| Feature | Baseline Mode | Adaptive Mode |
| :--- | :--- | :--- |
| **Telemetry Ingestion** | All clicks, timing, and events are recorded to DB | All clicks, timing, and events are recorded to DB |
| **Rule Engine Evaluation** | Rules are evaluated in background for statistical comparison | Rules are evaluated in real time |
| **UI Modifications** | **Disabled** (Static learning flow) | **Active** (Dynamic hints, summary toggles, fast-track modals) |
| **Purpose** | Control group for empirical comparative evaluation | Experimental condition with cognitive scaffolding |

### How to Toggle Modes
1. In the header bar, click the **`Baseline`** or **`Adaptive`** button in the `MODE` selector.
2. The mode switch takes effect immediately for the active session and logs a `MODE_TOGGLED` telemetry event to the database.

---

## Getting Started & Local Execution

### Prerequisites
- Node.js (v18 or higher, tested on Node v24)
- npm

### 1. Start the Backend Server
```bash
cd server
npm install
npm start
```
*The server will start on `http://localhost:5000` (connecting to your local/Atlas MongoDB or automatically falling back to embedded storage if MongoDB is not running).*

To run the automated test suite:
```bash
npm test
```

### 2. Start the Frontend Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
*Open your browser and navigate to `http://localhost:5173`.*

---

## Verifying the Three Adaptation Rules

1. **Trigger Rule 1 (Idle Inactivity Hint):**
   - Start in **Adaptive Mode**.
   - Stay on Step 1 without moving your mouse or clicking for 20 seconds.
   - Observe the **Cognitive Assistance & Clarification Hint** overlay appear.

2. **Trigger Rule 2 (Struggle & Summary View):**
   - Navigate to Step 2, then click back to Step 1, then forward to Step 2, and back again.
   - Observe the **Struggling Detected** banner offering the structured **Summary View**.

3. **Trigger Rule 3 (High-Proficiency Fast Track):**
   - Answer Step 1 and Step 2 quizzes correctly on your first attempt in under 25 seconds each.
   - Observe the **Fast Track Acceleration** prompt offering an immediate shortcut to Step 4.

4. **Review Results in Admin Dashboard:**
   - Click **`Admin & Results`** in the top navigation bar.
   - Inspect the aggregated metrics, Rule Trigger Breakdown, Baseline vs Adaptive comparison table, and export the dataset as JSON.
