import express from 'express';
import Adaptation from '../models/Adaptation.js';
import Event from '../models/Event.js';

const router = express.Router();

// Get adaptations for a specific session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const adaptations = await Adaptation.find({ sessionId: req.params.sessionId }).sort({ timestamp: -1 });
    res.json({ success: true, adaptations, count: adaptations.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update adaptation status (e.g. ACCEPTED, DISMISSED)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'DISMISSED', 'ACCEPTED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const adaptation = await Adaptation.findById(req.params.id);
    if (!adaptation) {
      return res.status(404).json({ success: false, error: 'Adaptation not found' });
    }

    adaptation.status = status;
    await adaptation.save();

    // Log user response event
    await new Event({
      sessionId: adaptation.sessionId,
      eventType: status === 'ACCEPTED' ? 'FAST_TRACK_ACCEPTED' : 'HINT_DISMISSED',
      stepIndex: adaptation.stepIndex,
      payload: { adaptationId: adaptation._id, ruleId: adaptation.ruleId, action: adaptation.actionApplied },
    }).save();

    res.json({ success: true, adaptation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
