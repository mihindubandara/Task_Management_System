const express = require('express');

const router = express.Router();

const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


// ==========================================
// PROJECT ROUTES
// ==========================================

// Get all projects
// Admin + Project Manager + Developer (their projects)
router.get(
    '/',
    authMiddleware,
    getProjects
);


// Get single project
router.get(
    '/:id',
    authMiddleware,
    getProjectById
);


// Create project
// ONLY Admin + Project Manager
router.post(
    '/',
    authMiddleware,
    roleMiddleware('Admin', 'Project Manager'),
    createProject
);


// Update project
// ONLY Admin + Project Manager
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware('Admin', 'Project Manager'),
    updateProject
);


// Delete project
// ONLY Admin
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware('Admin'),
    deleteProject
);


module.exports = router;