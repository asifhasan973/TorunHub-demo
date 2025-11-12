const admin = require('firebase-admin');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize Firebase Admin
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    const serviceAccount = require('./firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}

// User Schema
const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String },
    photoURL: { type: String },
    role: { type: String, enum: ['user', 'subadmin', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

async function createDemoAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@torunhutdemo.com';
    const adminPassword = '123456';
    const adminDisplayName = 'TorunHut Admin';

    console.log('\n🔄 Creating Firebase admin user...');
    
    let userRecord;
    try {
      // Check if user already exists in Firebase
      userRecord = await admin.auth().getUserByEmail(adminEmail);
      console.log('⚠️  Admin user already exists in Firebase');
      
      // Update password
      await admin.auth().updateUser(userRecord.uid, {
        password: adminPassword,
      });
      console.log('✅ Password updated');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        userRecord = await admin.auth().createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: adminDisplayName,
          emailVerified: true, // Auto-verify for demo
        });
        console.log('✅ Firebase admin user created');
      } else {
        throw error;
      }
    }

    console.log('\n🔄 Creating/updating MongoDB user record...');
    
    // Create or update user in MongoDB
    let mongoUser = await User.findOne({ uid: userRecord.uid });
    
    if (mongoUser) {
      mongoUser.role = 'admin';
      mongoUser.email = adminEmail;
      mongoUser.displayName = adminDisplayName;
      await mongoUser.save();
      console.log('✅ Existing user promoted to admin');
    } else {
      mongoUser = new User({
        uid: userRecord.uid,
        email: adminEmail,
        displayName: adminDisplayName,
        role: 'admin',
      });
      await mongoUser.save();
      console.log('✅ New admin user created in MongoDB');
    }

    console.log('='.repeat(50));
    console.log('✅ DEMO ADMIN ACCOUNT CREATED');
    console.log('='.repeat(50));
    console.log('Email:    admin@torunhutdemo.com');
    console.log('Password: 123456');
    console.log('Role:     admin');
    console.log('='.repeat(50));
    console.log('\n📝 Use these credentials to login at:');
    console.log('   http://localhost:5174/admin/login\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDemoAdmin();
