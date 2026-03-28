const { MongoClient } = require('mongodb');

function normalizeDoc(doc) {
  const id = doc.id ?? doc._id?.toString?.() ?? Date.now();
  return {
    id: typeof id === 'string' && id.length > 12 ? Number(id.slice(-10)) || id : Number(id) || id,
    district: doc.district,
    type: doc.type,
    description: doc.description || '',
    location: doc.location || 'Unknown',
    status: doc.status || 'Open',
    timestamp: doc.timestamp || new Date().toISOString(),
    anonymous: doc.anonymous !== false,
  };
}

class MemoryReportsStore {
  async loadInitial(seedReports) {
    this.items = seedReports.map((r) => normalizeDoc(r));
    return this.items;
  }

  async findAll(filters = {}) {
    let list = [...this.items];
    if (filters.district) list = list.filter((r) => r.district === filters.district);
    if (filters.status) list = list.filter((r) => r.status === filters.status);
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async insert(body) {
    const report = normalizeDoc({
      id: Date.now(),
      district: body.district,
      type: body.type,
      description: body.description || '',
      location: body.location || 'Unknown',
      status: 'Open',
      timestamp: new Date().toISOString(),
      anonymous: true,
    });
    this.items.unshift(report);
    return report;
  }

  async updateStatus(id, status) {
    const n = Number(id);
    const r = this.items.find((x) => x.id === n || String(x.id) === String(id));
    if (!r) return null;
    r.status = status;
    return r;
  }
}

class MongoReportsStore {
  constructor(uri) {
    this.uri = uri;
    this.client = null;
    this.col = null;
  }

  async connect() {
    this.client = new MongoClient(this.uri);
    await this.client.connect();
    const db = this.client.db(process.env.MONGODB_DB || 'whisp');
    this.col = db.collection('citizen_reports');
    await this.col.createIndex({ timestamp: -1 });
    await this.col.createIndex({ district: 1, status: 1 });
  }

  async loadInitial(seedReports) {
    await this.connect();
    const count = await this.col.countDocuments();
    if (count === 0 && seedReports.length) {
      await this.col.insertMany(
        seedReports.map((r) => ({
          ...r,
          createdAt: new Date(),
        }))
      );
    }
    const docs = await this.col.find({}).sort({ timestamp: -1 }).toArray();
    return docs.map((d) =>
      normalizeDoc({
        id: d.id ?? d._id.toString(),
        district: d.district,
        type: d.type,
        description: d.description,
        location: d.location,
        status: d.status,
        timestamp: d.timestamp,
        anonymous: d.anonymous,
      })
    );
  }

  async findAll(filters = {}) {
    const q = {};
    if (filters.district) q.district = filters.district;
    if (filters.status) q.status = filters.status;
    const docs = await this.col.find(q).sort({ timestamp: -1 }).toArray();
    return docs.map((d) =>
      normalizeDoc({
        id: d.id ?? d._id.toString(),
        district: d.district,
        type: d.type,
        description: d.description,
        location: d.location,
        status: d.status,
        timestamp: d.timestamp,
        anonymous: d.anonymous,
      })
    );
  }

  async insert(body) {
    const report = {
      id: Date.now(),
      district: body.district,
      type: body.type,
      description: body.description || '',
      location: body.location || 'Unknown',
      status: 'Open',
      timestamp: new Date().toISOString(),
      anonymous: true,
      createdAt: new Date(),
    };
    await this.col.insertOne(report);
    return normalizeDoc(report);
  }

  async updateStatus(id, status) {
    const n = Number(id);
    await this.col.updateOne({ id: n }, { $set: { status } });
    let doc = await this.col.findOne({ id: n });
    if (!doc) doc = await this.col.findOne({ id: String(id) });
    if (!doc) return null;
    return normalizeDoc(doc);
  }
}

async function createReportsStore(seedReports) {
  if (process.env.MONGODB_URI) {
    const store = new MongoReportsStore(process.env.MONGODB_URI);
    await store.loadInitial(seedReports);
    return store;
  }
  const mem = new MemoryReportsStore();
  await mem.loadInitial(seedReports);
  return mem;
}

module.exports = {
  createReportsStore,
};
