const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../server/.env' });

// Import models
const User = require('../server/models/User');
const Question = require('../server/models/Question');
const Answer = require('../server/models/Answer');
const Notification = require('../server/models/Notification');

async function backupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('✅ Connected to MongoDB');

    // Create backup directory
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    // Fetch all data
    console.log('📥 Fetching data...');
    const users = await User.find({}).lean();
    const questions = await Question.find({}).lean();
    const answers = await Answer.find({}).lean();
    const notifications = await Notification.find({}).lean();

    // Create backup object
    const backup = {
      timestamp: new Date().toISOString(),
      database: 'stackit',
      collections: {
        users: users,
        questions: questions,
        answers: answers,
        notifications: notifications
      },
      stats: {
        users: users.length,
        questions: questions.length,
        answers: answers.length,
        notifications: notifications.length
      }
    };

    // Write backup to file
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log('✅ Backup completed successfully!');
    console.log(`📁 Backup saved to: ${backupFile}`);
    console.log(`📊 Backup stats:`);
    console.log(`   - Users: ${backup.stats.users}`);
    console.log(`   - Questions: ${backup.stats.questions}`);
    console.log(`   - Answers: ${backup.stats.answers}`);
    console.log(`   - Notifications: ${backup.stats.notifications}`);

  } catch (error) {
    console.error('❌ Error creating backup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

async function restoreDatabase(backupFile) {
  try {
    // Check if backup file exists
    if (!fs.existsSync(backupFile)) {
      console.error('❌ Backup file not found:', backupFile);
      return;
    }

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('✅ Connected to MongoDB');

    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    console.log('📥 Reading backup data...');

    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});
    await Notification.deleteMany({});
    console.log('✅ Cleared existing data');

    // Restore data
    if (backupData.collections.users.length > 0) {
      await User.insertMany(backupData.collections.users);
      console.log(`✅ Restored ${backupData.collections.users.length} users`);
    }

    if (backupData.collections.questions.length > 0) {
      await Question.insertMany(backupData.collections.questions);
      console.log(`✅ Restored ${backupData.collections.questions.length} questions`);
    }

    if (backupData.collections.answers.length > 0) {
      await Answer.insertMany(backupData.collections.answers);
      console.log(`✅ Restored ${backupData.collections.answers.length} answers`);
    }

    if (backupData.collections.notifications.length > 0) {
      await Notification.insertMany(backupData.collections.notifications);
      console.log(`✅ Restored ${backupData.collections.notifications.length} notifications`);
    }

    console.log('🎉 Database restored successfully!');

  } catch (error) {
    console.error('❌ Error restoring database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Command line interface
const command = process.argv[2];
const backupFile = process.argv[3];

if (command === 'backup') {
  backupDatabase();
} else if (command === 'restore' && backupFile) {
  restoreDatabase(backupFile);
} else {
  console.log('Usage:');
  console.log('  node backup.js backup                    # Create backup');
  console.log('  node backup.js restore <backup-file>     # Restore from backup');
} 