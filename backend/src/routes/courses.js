import express from 'express';
import {
  createCourse,
  getCreatedCourses,
  getEnrolledCourses,
  getCourseUsers,
  removeUser,
  leaveCourse
} from '../controllers/courseController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createCourse);
router.get('/created', authenticateToken, getCreatedCourses);
router.get('/enrolled', authenticateToken, getEnrolledCourses);
router.get('/:courseId/users', authenticateToken, getCourseUsers);
router.delete('/:courseId/users/:userId', authenticateToken, removeUser);
router.delete('/:courseId/leave', authenticateToken, leaveCourse);

export default router;