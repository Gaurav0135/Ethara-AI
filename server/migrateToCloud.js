import mongoose from 'mongoose';
import dns from 'dns';

// Configure Node.js DNS to use working system DNS resolvers for SRV records
dns.setServers(['10.96.241.29', '8.8.8.8', '1.1.1.1']);

const localUri = 'mongodb://127.0.0.1:27017/team-task-manager';
const cloudUri = 'mongodb+srv://team-task-manager:Teamtask@cluster0.t5dzobo.mongodb.net/team-task-manager?appName=Cluster0';

async function migrate() {
  console.log('Starting database migration from local to cloud...');
  
  console.log('Connecting to local database...');
  const localDb = await mongoose.createConnection(localUri).asPromise();
  console.log('Connected to local database.');

  console.log('Connecting to cloud database...');
  const cloudDb = await mongoose.createConnection(cloudUri).asPromise();
  console.log('Connected to cloud database.');

  // List of collections to migrate
  const collections = ['users', 'projects', 'tasks'];

  for (const colName of collections) {
    console.log(`\n--- Processing collection: ${colName} ---`);
    const localCollection = localDb.db.collection(colName);
    const docs = await localCollection.find({}).toArray();
    console.log(`Found ${docs.length} documents in local '${colName}' collection.`);

    if (docs.length > 0) {
      const cloudCollection = cloudDb.db.collection(colName);
      console.log(`Clearing existing documents in cloud '${colName}' collection...`);
      await cloudCollection.deleteMany({});
      
      console.log(`Inserting ${docs.length} documents into cloud '${colName}' collection...`);
      await cloudCollection.insertMany(docs);
      console.log(`Successfully migrated '${colName}'.`);
    } else {
      console.log(`No documents to migrate for '${colName}'.`);
    }
  }

  console.log('\nMigration completed successfully!');
  await localDb.close();
  await cloudDb.close();
  process.exit(0);
}

migrate().catch(async (err) => {
  console.error('Migration failed with error:', err);
  process.exit(1);
});
