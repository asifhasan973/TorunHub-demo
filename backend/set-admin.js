const mongoose = require('mongoose');
require('dotenv').config();

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

async function setAdminRole() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Find all users
    const users = await User.find();
    
    if (users.length === 0) {
      process.exit(0);
    }

    users.forEach((user, index) => {
    });

    // Set first user (or most recent) to admin
    const userToPromote = users[users.length - 1]; // Get the last registered user
    
    
    userToPromote.role = 'admin';
    await userToPromote.save();
    

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

setAdminRole();
