import { getSignalsCollection, getCompetitorsCollection, getActivityLogCollection, getCustomerTranscriptsCollection } from './db.js';
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
export async function getAllSignals(limit = 500) {
  const collection = await getSignalsCollection();
  return collection.find({}).sort({ timestamp: -1 }).limit(limit).toArray();
}

/**
 * Get signals for a specific competitor
 */
export async function getSignalsByCompetitor(competitorId, limit = 100) {
  const collection = await getSignalsCollection();
  return collection.find({ competitorId }).sort({ timestamp: -1 }).limit(limit).toArray();
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
export async function getAllCompetitors(limit = 1000) {
  const collection = await getCompetitorsCollection();
  return collection.find({}).limit(limit).toArray();
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

/**
 * Add customer transcript to MongoDB
 */
export async function addCustomerTranscript(transcript) {
  const collection = await getCustomerTranscriptsCollection();
  const result = await collection.insertOne({
    ...transcript,
    createdAt: new Date(),
  });
  return result;
}

/**
 * Get all customer transcripts from MongoDB
 */
export async function getAllCustomerTranscripts(limit = 200) {
  const collection = await getCustomerTranscriptsCollection();
  return collection.find({}).sort({ date: -1 }).limit(limit).toArray();
}

/**
 * Get transcripts mentioning a specific competitor
 */
export async function getTranscriptsByCompetitor(competitorId, limit = 100) {
  const collection = await getCustomerTranscriptsCollection();
  return collection.find({ 
    competitorsMentioned: competitorId 
  }).sort({ date: -1 }).limit(limit).toArray();
}

/**
 * Migrate customer transcripts to MongoDB
 */
export async function migrateCustomerTranscripts() {
  const { customerTranscripts } = await import('./customer-transcripts.js');
  const collection = await getCustomerTranscriptsCollection();
  
  // Clear existing
  await collection.deleteMany({});
  
  // Insert transcripts
  if (customerTranscripts && customerTranscripts.length > 0) {
    await collection.insertMany(customerTranscripts);
    console.log(`✅ Migrated ${customerTranscripts.length} customer transcripts to MongoDB`);
  }
  
  // Create indexes
  await collection.createIndex({ competitorsMentioned: 1 });
  await collection.createIndex({ date: -1 });
  await collection.createIndex({ customerName: 1 });
  
  return { success: true, count: customerTranscripts.length };
}
