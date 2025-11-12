const mongoose = require('mongoose');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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

async function syncFirebaseUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Get all Firebase users
    const listUsersResult = await admin.auth().listUsers();
    const firebaseUsers = listUsersResult.users;

    if (firebaseUsers.length === 0) {
      process.exit(0);
    }


    for (let i = 0; i < firebaseUsers.length; i++) {
      const fbUser = firebaseUsers[i];

      // Check if user exists in MongoDB
      let mongoUser = await User.findOne({ uid: fbUser.uid });

      if (mongoUser) {
      } else {
        
        mongoUser = new User({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email.split('@')[0],
          photoURL: fbUser.photoURL || null,
          role: 'user', // Default role
        });
        await mongoUser.save();
      }
    }

    // Now promote the most recent user to admin
    const allUsers = await User.find().sort({ createdAt: -1 });
    const userToPromote = allUsers[0]; // Get most recent user

    if (userToPromote.role === 'admin') {
    } else {
      userToPromote.role = 'admin';
      await userToPromote.save();
    }


    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

syncFirebaseUsers();
