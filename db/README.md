# Database Directory

This directory contains database-related scripts and utilities for the StackIt Q&A platform.

## 📁 Directory Structure

```
db/
├── seed.js          # Database seeding script
├── backup.js        # Database backup/restore script
├── backups/         # Backup files directory (created automatically)
└── README.md        # This file
```

## 🗄️ Database Information

- **Database Type**: MongoDB
- **Database Name**: `stackit`
- **Connection String**: `mongodb://localhost:27017/stackit`

## 📊 Database Collections

### Users Collection
- User profiles and authentication data
- Reputation and verification status
- Preferences and settings

### Questions Collection
- Question content and metadata
- Tags, language, and author information
- Voting, views, and following data

### Answers Collection
- Answer content and metadata
- Author and question references
- Voting and acceptance status

### Notifications Collection
- User notifications and alerts
- Activity tracking and messaging

## 🛠️ Database Scripts

### Seed Database
Populate the database with sample data for development:

```bash
cd db
node seed.js
```

**Sample Data Created:**
- 3 users (English and Hindi)
- 3 questions (bilingual)
- 3 answers
- All with realistic data and relationships

### Backup Database
Create a backup of all database collections:

```bash
cd db
node backup.js backup
```

**Backup Features:**
- Timestamped backup files
- JSON format for easy inspection
- Includes all collections
- Statistics summary

### Restore Database
Restore database from a backup file:

```bash
cd db
node backup.js restore backups/backup-2024-01-01T12-00-00-000Z.json
```

**Restore Features:**
- Clears existing data
- Restores all collections
- Maintains data relationships
- Progress reporting

## 🔧 Database Setup

### Prerequisites
1. **MongoDB Installation**
   - Install MongoDB on your system
   - Start MongoDB service
   - Ensure it's running on port 27017

2. **Environment Configuration**
   - Copy `../server/env.example` to `../server/.env`
   - Configure MongoDB connection string

### Quick Setup
```bash
# Start MongoDB
mongod

# In another terminal, setup the database
cd db
node seed.js
```

## 📈 Database Statistics

After seeding, you'll have:
- **Users**: 3 (2 English, 1 Hindi)
- **Questions**: 3 (2 English, 1 Hindi)
- **Answers**: 3
- **Notifications**: 0 (created during usage)

## 🔍 Database Queries

### Common MongoDB Queries

```javascript
// Find all questions in English
db.questions.find({ language: 'en' })

// Find questions by tag
db.questions.find({ tags: 'react' })

// Find users with high reputation
db.users.find({ reputation: { $gte: 100 } })

// Find questions with answers
db.questions.find({ answerCount: { $gt: 0 } })
```

### Indexes
The database includes indexes for:
- Text search on questions and answers
- User email and phone uniqueness
- Question tags and language
- Answer question references
- Notification user references

## 🚨 Important Notes

1. **Development Only**: These scripts are for development purposes
2. **Data Loss**: Backup/restore operations will clear existing data
3. **Environment**: Ensure MongoDB is running before using scripts
4. **Permissions**: Scripts need read/write access to the database

## 🔗 Related Files

- `../server/models/` - Database models and schemas
- `../server/.env` - Database configuration
- `../server/server.js` - Database connection setup 