import express from 'express';
import Event from '../models/Event.js';
import Session from '../models/Session.js';
import { evaluateAdaptation } from '../engine/adaptationEngine.js';

const router = express.Router();

// Ingest user interaction event & evaluate adaptation engine in real-time
router.post('/', async (req, res) => {
  try {
    const {
      sessionId,
      eventType,
      stepIndex,
      payload = {},
      timeOnStepMs = 0,
      idleDurationMs = 0,
    } = req.body;

    if (!sessionId || !eventType || !stepIndex) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, eventType, stepIndex',
      });
    }

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Persist event to MongoDB
    const event = new Event({
      sessionId,
      eventType,
      stepIndex,
      payload,
      timeOnStepMs,
      idleDurationMs,
    });
    await event.save();

    // Evaluate adaptation rules against session state
    const adaptationResult = await evaluateAdaptation(session, event);

    res.status(201).json({
      success: true,
      event,
      isAdaptiveMode: adaptationResult.isAdaptiveMode,
      triggeredAdaptations: adaptationResult.triggeredAdaptations,
    });
  } catch (err) {
    console.error('Error logging event:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all events for a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const events = await Event.find({ sessionId: req.params.sessionId }).sort({ timestamp: 1 });
    res.json({ success: true, events, count: events.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
