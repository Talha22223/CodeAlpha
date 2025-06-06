const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profilePic: { type: String, default: '' },
  coverPic: { type: String, default: '' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  privacy: {
    profileVisibility: { type: String, default: 'public' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
