import mongoose from 'mongoose';
import { isConnectedToMongo } from '../db.js';
import { inMemoryDB } from '../embeddedDb.js';

const EventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'SESSION_START',
        'STEP_VIEW',
        'STEP_NAVIGATE',
        'STEP_REVISIT',
        'IDLE_TIMEOUT',
        'CLICK',
        'QUIZ_ATTEMPT',
        'QUIZ_SUCCESS',
        'QUIZ_FAILURE',
        'HINT_REQUESTED',
        'HINT_DISMISSED',
        'SUMMARY_VIEW_TOGGLED',
        'FAST_TRACK_ACCEPTED',
        'FAST_TRACK_DECLINED',
        'MODE_TOGGLED',
        'SESSION_COMPLETE',
        'FITTS_TRIAL_START',
        'FITTS_TARGET_ACQUIRED',
      ],
      index: true,
    },
    stepIndex: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timeOnStepMs: {
      type: Number,
      default: 0,
    },
    idleDurationMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseEvent = mongoose.models.Event || mongoose.model('Event', EventSchema);

export default class Event {
  constructor(data = {}) {
    if (isConnectedToMongo) {
      return new MongooseEvent(data);
    }
    this._id = data._id || 'ev_' + Math.random().toString(36).substr(2, 9);
    this.sessionId = data.sessionId;
    this.timestamp = data.timestamp || new Date();
    this.eventType = data.eventType;
    this.stepIndex = data.stepIndex;
    this.payload = data.payload || {};
    this.timeOnStepMs = data.timeOnStepMs || 0;
    this.idleDurationMs = data.idleDurationMs || 0;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async find(filter = {}) {
    if (isConnectedToMongo) return MongooseEvent.find(filter);
    return inMemoryDB.events.find(filter);
  }

  static async findOne(filter = {}) {
    if (isConnectedToMongo) return MongooseEvent.findOne(filter);
    return inMemoryDB.events.findOne(filter);
  }

  static async countDocuments(filter = {}) {
    if (isConnectedToMongo) return MongooseEvent.countDocuments(filter);
    return inMemoryDB.events.countDocuments(filter);
  }

  static async aggregate(pipeline = []) {
    if (isConnectedToMongo) return MongooseEvent.aggregate(pipeline);
    return inMemoryDB.events.aggregate(pipeline);
  }

  async save() {
    if (isConnectedToMongo && this instanceof MongooseEvent) {
      return this.save();
    }
    return inMemoryDB.events.save(this);
  }
}
