import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Session from '../models/Session.js';
import Event from '../models/Event.js';

const router = express.Router();

// Create new session
router.post('/', async (req, res) => {
  try {
    const { mode = 'adaptive', metadata = {} } = req.body;
    const sessionId = uuidv4();

    const session = new Session({
      sessionId,
      mode,
      currentStep: 1,
      metadata,
    });
    await session.save();

    // Log SESSION_START event
    const startEvent = new Event({
      sessionId,
      eventType: 'SESSION_START',
      stepIndex: 1,
      payload: { mode, metadata },
    });
    await startEvent.save();

    res.status(201).json({ success: true, session });
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get session by ID
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.id });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle mode (baseline vs adaptive)
router.patch('/:id/mode', async (req, res) => {
  try {
    const { mode } = req.body;
    if (!['baseline', 'adaptive'].includes(mode)) {
      return res.status(400).json({ success: false, error: 'Invalid mode' });
    }

    const session = await Session.findOne({ sessionId: req.params.id });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const oldMode = session.mode;
    session.mode = mode;
    await session.save();

    // Log mode change
    const modeEvent = new Event({
      sessionId: session.sessionId,
      eventType: 'MODE_TOGGLED',
      stepIndex: session.currentStep,
      payload: { previousMode: oldMode, newMode: mode },
    });
    await modeEvent.save();

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update current step or complete session
router.patch('/:id/step', async (req, res) => {
  try {
    const { stepIndex, completed } = req.body;
    const session = await Session.findOne({ sessionId: req.params.id });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    if (stepIndex) session.currentStep = stepIndex;
    if (completed !== undefined) {
      session.completed = completed;
      if (completed) {
        session.endTime = new Date();
        session.totalDurationMs = session.endTime.getTime() - new Date(session.startTime).getTime();
        
        await new Event({
          sessionId: session.sessionId,
          eventType: 'SESSION_COMPLETE',
          stepIndex: session.currentStep,
          payload: { totalDurationMs: session.totalDurationMs },
        }).save();
      }
    }

    await session.save();
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
