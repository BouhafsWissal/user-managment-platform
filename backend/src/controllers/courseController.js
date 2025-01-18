import Course from '../models/Course.js';

export const createCourse = async (req, res) => {
  console.log("Route createCourse appelée"); // Ajouter ce log ici pour tester si la route est atteinte
  try {
    const { title, description } = req.body;
    const creatorId = req.user.id; 
    const creatorEmail = req.user.email;  // Récupérer l'email du créateur
    console.log("hhhhhhhhhhhhhhh");
    console.log("Creator ID:", creatorId);  // Affiche l'ID du créateur
    console.log("Creator Email:", creatorEmail);  // Affiche l'email du créateur

    if (!req.user.isCreator) {
      return res.status(403).json({ error: 'Only creators can create courses' });
    }

    // Créer un nouveau cours avec l'ID du créateur
    const course = await Course.create({ title, description, creatorId });

    // Retourner le cours créé, ainsi que l'ID et l'email du créateur
    res.status(201).json({
      course,
      creator: {
        id: creatorId,
        email: creatorEmail
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating course' });
  }
};




export const getCreatedCourses = async (req, res) => {
  try {
    if (!req.user.isCreator) {
      return res.status(403).json({ error: 'Only creators can view created courses' });
    }

    const courses = await Course.findByCreator(req.user.id); // Utilise req.user.id pour récupérer les cours du créateur
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching courses' });
  }
};

export const getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.findEnrolledCourses(req.user.id); // Récupère les cours auxquels l'utilisateur est inscrit
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
