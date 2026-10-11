import mongoose from 'mongoose';
import { isConnectedToMongo } from '../db.js';
import { inMemoryDB } from '../embeddedDb.js';

const AdaptationSchema = new mongoose.Schema(
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
    ruleId: {
      type: String,
      required: true,
      enum: ['RULE_IDLE_HINT', 'RULE_REVISIT_STRUGGLE', 'RULE_FAST_TRACK'],
    },
    ruleName: {
      type: String,
      required: true,
    },
    stepIndex: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    triggerCondition: {
      type: String,
      required: true,
    },
    actionApplied: {
      type: String,
      required: true,
      enum: ['SHOW_HINT', 'OFFER_SUMMARY_VIEW', 'OFFER_FAST_TRACK'],
    },
    adaptationPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['TRIGGERED', 'ACTIVE', 'DISMISSED', 'ACCEPTED'],
      default: 'TRIGGERED',
    },
    evaluatedInMode: {
      type: String,
      enum: ['baseline', 'adaptive'],
      default: 'adaptive',
    },
  },
  {
    timestamps: true,
  }
);

const MongooseAdaptation = mongoose.models.Adaptation || mongoose.model('Adaptation', AdaptationSchema);

export default class Adaptation {
  constructor(data = {}) {
    if (isConnectedToMongo) {
      return new MongooseAdaptation(data);
    }
    this._id = data._id || 'adapt_' + Math.random().toString(36).substr(2, 9);
    this.sessionId = data.sessionId;
    this.timestamp = data.timestamp || new Date();
    this.ruleId = data.ruleId;
    this.ruleName = data.ruleName;
    this.stepIndex = data.stepIndex;
    this.triggerCondition = data.triggerCondition;
    this.actionApplied = data.actionApplied;
    this.adaptationPayload = data.adaptationPayload || {};
    this.status = data.status || 'TRIGGERED';
    this.evaluatedInMode = data.evaluatedInMode || 'adaptive';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async find(filter = {}) {
    if (isConnectedToMongo) return MongooseAdaptation.find(filter);
    return inMemoryDB.adaptations.find(filter);
  }

  static async findOne(filter = {}) {
    if (isConnectedToMongo) return MongooseAdaptation.findOne(filter);
    return inMemoryDB.adaptations.findOne(filter);
  }

  static async findById(id) {
    if (isConnectedToMongo) return MongooseAdaptation.findById(id);
    return inMemoryDB.adaptations.findById(id);
  }

  static async countDocuments(filter = {}) {
    if (isConnectedToMongo) return MongooseAdaptation.countDocuments(filter);
    return inMemoryDB.adaptations.countDocuments(filter);
  }

  static async aggregate(pipeline = []) {
    if (isConnectedToMongo) return MongooseAdaptation.aggregate(pipeline);
    return inMemoryDB.adaptations.aggregate(pipeline);
  }

  async save() {
    if (isConnectedToMongo && this instanceof MongooseAdaptation) {
      return this.save();
    }
    return inMemoryDB.adaptations.save(this);
  }
}
