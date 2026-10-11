import mongoose from 'mongoose';
import { isConnectedToMongo } from '../db.js';
import { inMemoryDB } from '../embeddedDb.js';

const SessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ['baseline', 'adaptive'],
      default: 'adaptive',
      required: true,
    },
    currentStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 4,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    totalDurationMs: {
      type: Number,
      default: 0,
    },
    stepMetrics: {
      type: Map,
      of: {
        timeSpentMs: { type: Number, default: 0 },
        visitCount: { type: Number, default: 1 },
        errorsCount: { type: Number, default: 0 },
        quizCompleted: { type: Boolean, default: false },
        lastInteractionAt: { type: Date, default: Date.now },
        idleExceeded: { type: Boolean, default: false },
        strugglingDetected: { type: Boolean, default: false },
        fastTrackOffered: { type: Boolean, default: false },
      },
      default: {},
    },
    metadata: {
      userAgent: String,
      screenResolution: String,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseSession = mongoose.models.Session || mongoose.model('Session', SessionSchema);

export default class Session {
  constructor(data = {}) {
    if (isConnectedToMongo) {
      return new MongooseSession(data);
    }
    this._id = data._id || 'sess_' + Math.random().toString(36).substr(2, 9);
    this.sessionId = data.sessionId;
    this.mode = data.mode || 'adaptive';
    this.currentStep = data.currentStep || 1;
    this.completed = data.completed || false;
    this.startTime = data.startTime || new Date();
    this.endTime = data.endTime;
    this.totalDurationMs = data.totalDurationMs || 0;
    this.stepMetrics = data.stepMetrics instanceof Map ? data.stepMetrics : new Map(Object.entries(data.stepMetrics || {}));
    this.metadata = data.metadata || {};
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async find(filter = {}) {
    if (isConnectedToMongo) return MongooseSession.find(filter);
    return inMemoryDB.sessions.find(filter);
  }

  static async findOne(filter = {}) {
    if (isConnectedToMongo) return MongooseSession.findOne(filter);
    return inMemoryDB.sessions.findOne(filter);
  }

  static async countDocuments(filter = {}) {
    if (isConnectedToMongo) return MongooseSession.countDocuments(filter);
    return inMemoryDB.sessions.countDocuments(filter);
  }

  static async aggregate(pipeline = []) {
    if (isConnectedToMongo) return MongooseSession.aggregate(pipeline);
    return inMemoryDB.sessions.aggregate(pipeline);
  }

  async save() {
    if (isConnectedToMongo && this instanceof MongooseSession) {
      return this.save();
    }
    return inMemoryDB.sessions.save(this);
  }

  markModified() {}
}
