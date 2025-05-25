const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middlewares/authMiddleware');

// Get own profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});
// Send Friend Request
router.post('/friend-request/:targetId', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  const target = await User.findById(req.params.targetId);
  if (!target) return res.status(404).json({ error: 'User not found' });

  if (!target.friendRequests.includes(user._id)) {
    target.friendRequests.push(user._id);
    await target.save();
  }
  res.json({ message: 'Friend request sent' });
});

// Accept Friend Request
router.post('/accept-request/:requesterId', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  const requester = await User.findById(req.params.requesterId);

  if (!user.friendRequests.includes(requester._id)) {
    return res.status(400).json({ error: 'No request from this user' });
  }

  user.friendRequests = user.friendRequests.filter(id => id.toString() !== requester._id.toString());
  user.friends.push(requester._id);
  requester.friends.push(user._id);

  await user.save();
  await requester.save();

  res.json({ message: 'Friend request accepted' });
});

module.exports = router;


