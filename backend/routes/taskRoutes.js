const express = require('express');

const router = express.Router();

const {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

const {
    authMiddleware
} = require('../middleware/authMiddleware');

const roleMiddleware = require('../middleware/roleMiddleware');


// ==========================================
// GET ALL TASKS
// Admin / PM -> All tasks
// Developer -> Own assigned tasks only
// ==========================================
router.get(
    '/',
    authMiddleware,
    getTasks
);


// ==========================================
// GET SINGLE TASK
// ==========================================
router.get(
    '/:id',
    authMiddleware,
    getTaskById
);


// ==========================================
// CREATE TASK
// ONLY Admin + Project Manager
// ==========================================
router.post(
    '/',
    authMiddleware,
    roleMiddleware('Admin', 'Project Manager'),
    createTask
);


// ==========================================
// UPDATE TASK
// Admin / PM -> Full update
// Developer -> Own task status only
// ==========================================
router.put(
    '/:id',
    authMiddleware,
    updateTask
);

// Fallback for status updates requested by frontend
router.put(
    '/:id/status',
    authMiddleware,
    updateTask
);


// ==========================================
// DELETE TASK
// ONLY Admin + Project Manager
// ==========================================
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware('Admin', 'Project Manager'),
    deleteTask
);


module.exports = router;