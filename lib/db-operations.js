import { getSignalsCollection, getCompetitorsCollection, getActivityLogCollection } from './db.js';
import { readJSON } from './storage.js';
import path from 'path';

/**
 * Migrate existing JSON data to MongoDB
 */
export async function migrateToMongoDB() {
  console.log('🔄 Starting migration from JSON to MongoDB...');
  
  try {
    // Migrate signals
    const signals = await readJSON(path.join(process.cwd(), 'data', 'signals.json'));
    const signalsCollection = await getSignalsCollection();
    
    // Clear existing data
    await signalsCollection.deleteMany({});
    
    if (signals && signals.length > 0) {
      await signalsCollection.insertMany(signals);
      console.log(`✅ Migrated ${signals.length} signals to MongoDB`);
    }
    
    // Migrate competitors
    const competitors = await readJSON(path.join(process.cwd(), 'data', 'competitors.json'));
    const competitorsCollection = await getCompetitorsCollection();
    
    // Clear existing data
    await competitorsCollection.deleteMany({});
    
    if (competitors && competitors.length > 0) {
      await competitorsCollection.insertMany(competitors);
      console.log(`✅ Migrated ${competitors.length} competitors to MongoDB`);
    }
    
    // Migrate activity log
    const activityLog = await readJSON(path.join(process.cwd(), 'data', 'activity-log.json'));
    const activityLogCollection = await getActivityLogCollection();
    
    // Clear existing data
    await activityLogCollection.deleteMany({});
    
    if (activityLog && activityLog.length > 0) {
      await activityLogCollection.insertMany(activityLog);
      console.log(`✅ Migrated ${activityLog.length} activity log entries to MongoDB`);
    }
    
    // Create indexes for better performance
    await signalsCollection.createIndex({ competitorId: 1, timestamp: -1 });
    await signalsCollection.createIndex({ severity: 1 });
    await signalsCollection.createIndex({ timestamp: -1 });
    await competitorsCollection.createIndex({ id: 1 }, { unique: true });
    await activityLogCollection.createIndex({ timestamp: -1 });
    
    console.log('✅ Created database indexes');
    console.log('🎉 Migration complete!');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Migration error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all signals from MongoDB
 */
export async function getAllSignals() {
  const collection = await getSignalsCollection();
  return collection.find({}).sort({ timestamp: -1 }).toArray();
}

/**
 * Get signals for a specific competitor
 */
export async function getSignalsByCompetitor(competitorId) {
  const collection = await getSignalsCollection();
  return collection.find({ competitorId }).sort({ timestamp: -1 }).toArray();
}

/**
 * Add a new signal to MongoDB
 */
export async function addSignal(signal) {
  const collection = await getSignalsCollection();
  const result = await collection.insertOne({
    ...signal,
    createdAt: new Date(),
  });
  return result;
}

/**
 * Get all competitors from MongoDB
 */
export async function getAllCompetitors() {
  const collection = await getCompetitorsCollection();
  return collection.find({}).toArray();
}

/**
 * Get a specific competitor by ID
 */
export async function getCompetitorById(id) {
  const collection = await getCompetitorsCollection();
  return collection.findOne({ id });
}

/**
 * Update a competitor in MongoDB
 */
export async function updateCompetitor(id, updates) {
  const collection = await getCompetitorsCollection();
  const result = await collection.updateOne(
    { id },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  return result;
}

/**
 * Add activity log entry to MongoDB
 */
export async function addActivityLog(entry) {
  const collection = await getActivityLogCollection();
  const result = await collection.insertOne({
    ...entry,
    timestamp: new Date(),
  });
  return result;
}

/**
 * Get recent activity log entries
 */
export async function getRecentActivityLog(limit = 100) {
  const collection = await getActivityLogCollection();
  return collection.find({}).sort({ timestamp: -1 }).limit(limit).toArray();
}
