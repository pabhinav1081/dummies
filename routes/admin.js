const express = require('express');
const User = require('../models/User');
const Point = require('../models/Point');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();


router.post(
    '/users/:id/events/:eventCode/points',
    authenticate,
    authorize(['admin']),
    async (req, res) => {
      try {
        const { points, reason } = req.body;
        const { id: userId, eventCode } = req.params;

        const targetUser = await User.findById(userId);
        if (!targetUser) {
          return res.status(404).json({ success: false, msg: 'User not found' });
        }


        const eventIndex = targetUser.eventScores.findIndex(e => e.eventCode === eventCode);
        if (eventIndex >= 0) {

          targetUser.eventScores[eventIndex].points += points;
        } else {

          targetUser.eventScores.push({ eventCode, points });
        }


        targetUser.totalPoints += points;
        await targetUser.save();


        const point = new Point({
          userId: req.params.id,
          eventId: null,
          points,
          reason,
          givenBy: req.user._id
        });
        await point.save();

        res.json({
          success: true,
          msg: `+${points} pts for ${eventCode} to ${targetUser.name}`,
          eventPoints: targetUser.eventScores.find(e => e.eventCode === eventCode)?.points || points,
          totalPoints: targetUser.totalPoints
        });
      } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
      }
    }
);
router.get(
    '/users',
    authenticate,
    authorize(['admin']),
    async (req, res) => {
      const users = await User.find()
          .select('name email totalPoints eventScores role')
          .sort({ totalPoints: -1 });
      res.json({ success: true, users });
    }
);

module.exports = router;
