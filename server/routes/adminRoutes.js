import express from 'express';
import Session from '../models/Session.js';
import Event from '../models/Event.js';
import Adaptation from '../models/Adaptation.js';

const router = express.Router();

// Get summary metrics and heuristic evaluation comparison
router.get('/metrics', async (req, res) => {
  try {
    const totalSessions = await Session.countDocuments();
    const baselineSessions = await Session.countDocuments({ mode: 'baseline' });
    const adaptiveSessions = await Session.countDocuments({ mode: 'adaptive' });
    const completedSessions = await Session.countDocuments({ completed: true });

    const totalEvents = await Event.countDocuments();
    const totalAdaptations = await Adaptation.countDocuments();

    // Adaptations by rule breakdown
    const ruleStats = await Adaptation.aggregate([
      {
        $group: {
          _id: '$ruleId',
          ruleName: { $first: '$ruleName' },
          count: { $sum: 1 },
          acceptedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'ACCEPTED'] }, 1, 0] },
          },
          dismissedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'DISMISSED'] }, 1, 0] },
          },
        },
      },
    ]);

    // Comparison between baseline vs adaptive completed sessions
    const completedStats = await Session.aggregate([
      { $match: { completed: true } },
      {
        $group: {
          _id: '$mode',
          avgDurationMs: { $avg: '$totalDurationMs' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Average events per session
    const eventsPerMode = await Event.aggregate([
      {
        $lookup: {
          from: 'sessions',
          localField: 'sessionId',
          foreignField: 'sessionId',
          as: 'session',
        },
      },
      { $unwind: '$session' },
      {
        $group: {
          _id: '$session.mode',
          totalEvents: { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          mode: '$_id',
          totalEvents: 1,
          avgEventsPerSession: {
            $divide: ['$totalEvents', { $size: '$uniqueSessions' }],
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalSessions,
        baselineSessions,
        adaptiveSessions,
        completedSessions,
        totalEvents,
        totalAdaptations,
        ruleStats,
        completedStats,
        eventsPerMode,
      },
    });
  } catch (err) {
    console.error('Error fetching admin metrics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// List all sessions with pagination and search
router.get('/sessions', async (req, res) => {
  try {
    const { mode, limit = 50, skip = 0 } = req.query;
    const filter = {};
    if (mode && ['baseline', 'adaptive'].includes(mode)) {
      filter.mode = mode;
    }

    const sessions = await Session.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10));

    const total = await Session.countDocuments(filter);

    res.json({ success: true, sessions, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get deep trace for a single session
router.get('/sessions/:sessionId/trace', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const events = await Event.find({ sessionId }).sort({ timestamp: 1 });
    const adaptations = await Adaptation.find({ sessionId }).sort({ timestamp: 1 });

    res.json({
      success: true,
      session,
      events,
      adaptations,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Full export of evaluation data
router.get('/export', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    const adaptations = await Adaptation.find().sort({ timestamp: 1 });
    const events = await Event.find().sort({ timestamp: 1 });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="hci_evaluation_dataset.json"');
    res.json({
      exportedAt: new Date(),
      sessions,
      adaptations,
      events,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
