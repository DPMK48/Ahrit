/**
 * Embedded In-Memory Datastore Fallback
 * Provides synchronous/asynchronous Mongoose-compatible mock layer
 * when a local or remote MongoDB instance is not available.
 */

class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.records = [];
  }

  async save(doc) {
    if (!doc._id) {
      doc._id = 'doc_' + Math.random().toString(36).substr(2, 9);
    }
    if (!doc.createdAt) {
      doc.createdAt = new Date();
    }
    doc.updatedAt = new Date();

    const existingIndex = this.records.findIndex(
      (r) => (r._id && r._id === doc._id) || (doc.sessionId && r.sessionId === doc.sessionId)
    );

    if (existingIndex >= 0) {
      this.records[existingIndex] = { ...this.records[existingIndex], ...doc };
      return this.records[existingIndex];
    } else {
      this.records.push(doc);
      return doc;
    }
  }

  async countDocuments(filter = {}) {
    return this.find(filter).then((docs) => docs.length);
  }

  async find(filter = {}) {
    let result = this.records.filter((rec) => {
      for (const [key, val] of Object.entries(filter)) {
        if (rec[key] !== val) return false;
      }
      return true;
    });

    const createQueryChain = (data) => {
      let currentData = [...data];
      const chain = {
        sort(sortObj = {}) {
          const [sortKey, sortDir] = Object.entries(sortObj)[0] || [];
          if (sortKey) {
            currentData.sort((a, b) => {
              const aVal = a[sortKey] instanceof Date ? a[sortKey].getTime() : a[sortKey];
              const bVal = b[sortKey] instanceof Date ? b[sortKey].getTime() : b[sortKey];
              if (sortDir === -1) return bVal > aVal ? 1 : -1;
              return aVal > bVal ? 1 : -1;
            });
          }
          return chain;
        },
        skip(n = 0) {
          currentData = currentData.slice(n);
          return chain;
        },
        limit(n = 50) {
          currentData = currentData.slice(0, n);
          return chain;
        },
        then(resolve, reject) {
          return Promise.resolve(currentData).then(resolve, reject);
        },
      };
      return chain;
    };

    return createQueryChain(result);
  }

  async findOne(filter = {}) {
    const list = await this.find(filter);
    if (!list || list.length === 0) return null;
    const doc = list[0];
    
    // Add Mongoose helper methods
    doc.save = async function () {
      doc.updatedAt = new Date();
      return doc;
    };
    doc.markModified = function () {};
    return doc;
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async aggregate(pipeline = []) {
    let current = [...this.records];

    for (const stage of pipeline) {
      if (stage.$match) {
        current = current.filter((r) => {
          for (const [k, v] of Object.entries(stage.$match)) {
            if (r[k] !== v) return false;
          }
          return true;
        });
      } else if (stage.$group) {
        const groups = {};
        const groupKey = stage.$group._id ? stage.$group._id.replace('$', '') : null;

        for (const item of current) {
          const keyVal = groupKey ? item[groupKey] : 'all';
          if (!groups[keyVal]) {
            groups[keyVal] = { _id: keyVal, items: [] };
          }
          groups[keyVal].items.push(item);
        }

        const aggregated = [];
        for (const [gId, gData] of Object.entries(groups)) {
          const out = { _id: gId };
          for (const [field, expr] of Object.entries(stage.$group)) {
            if (field === '_id') continue;
            if (expr.$sum === 1) {
              out[field] = gData.items.length;
            } else if (expr.$first) {
              const fKey = expr.$first.replace('$', '');
              out[field] = gData.items[0]?.[fKey];
            } else if (expr.$avg) {
              const aKey = expr.$avg.replace('$', '');
              const sum = gData.items.reduce((acc, it) => acc + (it[aKey] || 0), 0);
              out[field] = sum / (gData.items.length || 1);
            } else if (expr.$sum && typeof expr.$sum === 'object' && expr.$sum.$cond) {
              const [cond, trueVal, falseVal] = expr.$sum.$cond;
              const condField = cond.$eq?.[0]?.replace('$', '');
              const matchVal = cond.$eq?.[1];
              out[field] = gData.items.filter((it) => it[condField] === matchVal).length;
            }
          }
          aggregated.push(out);
        }
        current = aggregated;
      }
    }

    return current;
  }
}

export const inMemoryDB = {
  sessions: new MemoryCollection('sessions'),
  events: new MemoryCollection('events'),
  adaptations: new MemoryCollection('adaptations'),
};
