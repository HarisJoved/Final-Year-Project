// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('handwriting_ocr');

// Create collections with proper indexes
db.createCollection('users');
db.createCollection('documents');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.documents.createIndex({ "user_id": 1 });
db.documents.createIndex({ "created_at": -1 });

print('Database initialized successfully!');
