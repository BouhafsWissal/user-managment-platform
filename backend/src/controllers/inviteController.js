import Invite from '../models/Invite.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

export const createInvite = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.body;

    const course = await Course.findByCreator(req.user.id);
    if (!course) {
      return res.status(403).json({ error: 'Not authorized to invite to this course' });
    }

    const invite = await Invite.create({ courseId, userId });
    res.status(201).json({ message: 'Invitation sent', invite });
  } catch (error) {
    res.status(400).json({ error: 'Invite already exists' });
  }
};

export const respondToInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { accept } = req.body;

    const invite = await Invite.findById(inviteId, req.user.id);
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    if (accept) {
      await Enrollment.create({ userId: req.user.id, courseId: invite.courseId });
      await Invite.updateStatus(inviteId, 'accepted');
      res.json({ message: 'Course joined successfully' });
    } else {
      await Invite.updateStatus(inviteId, 'rejected');
      res.json({ message: 'Invite rejected' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Error processing invite response' });
  }
};