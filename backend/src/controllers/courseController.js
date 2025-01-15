import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

export const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const creatorId = req.user.id;

    if (!req.user.isCreator) {
      return res.status(403).json({ error: 'Only creators can create courses' });
    }

    const course = await Course.create({ title, description, creatorId });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Error creating course' });
  }
};

export const getCreatedCourses = async (req, res) => {
  try {
    if (!req.user.isCreator) {
      return res.status(403).json({ error: 'Only creators can view created courses' });
    }

    const courses = await Course.findByCreator(req.user.id);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching courses' });
  }
};

export const getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.findEnrolledCourses(req.user.id);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching enrolled courses' });
  }
};

export const getCourseUsers = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByCreator(req.user.id);
    
    if (!course) {
      return res.status(403).json({ error: 'Not authorized to view course users' });
    }

    const users = await Course.findEnrolledUsers(courseId);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching course users' });
  }
};

export const removeUser = async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    const course = await Course.findByCreator(req.user.id);
    
    if (!course) {
      return res.status(403).json({ error: 'Not authorized to remove users' });
    }

    await Enrollment.remove({ userId, courseId });
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing user' });
  }
};

export const leaveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    await Enrollment.remove({ userId: req.user.id, courseId });
    res.json({ message: 'Left course successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error leaving course' });
  }
};