const Task = require('../models/Task');

// ======================================================
// CREATE TASK
// Admin / Project Manager ONLY
// ======================================================
const createTask = async (req, res) => {
    try {
        if (
            req.user.role !== 'Admin' &&
            req.user.role !== 'Project Manager'
        ) {
            return res.status(403).json({
                message: 'Access denied. Only Admin or Project Manager can create tasks.'
            });
        }

        const {
            title,
            description,
            status,
            priority,
            dueDate,
            projectId,
            assignedTo
        } = req.body;

        if (!title || !description || !projectId || !assignedTo) {
            return res.status(400).json({
                message: 'Title, description, project and developer are required.'
            });
        }

        const task = new Task({
            title,
            description,
            status: status || 'To Do',
            priority: priority || 'Medium',
            dueDate,
            projectId,
            assignedTo
        });

        const savedTask = await task.save();

        const populatedTask = await Task.findById(savedTask._id)
            .populate('assignedTo', 'name email role')
            .populate('projectId', 'title');

        res.status(201).json({
            message: 'Task created successfully',
            task: populatedTask
        });

    } catch (error) {
        console.error('Create Task Error:', error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// ======================================================
// GET TASKS
// Admin / PM → All tasks
// Developer → Assigned tasks only
// ======================================================
const getTasks = async (req, res) => {
    try {
        let tasks;

        if (
            req.user.role === 'Admin' ||
            req.user.role === 'Project Manager'
        ) {
            tasks = await Task.find()
                .populate('assignedTo', 'name email role')
                .populate('projectId', 'title')
                .sort({ createdAt: -1 });
        }

        else if (req.user.role === 'Developer') {
            tasks = await Task.find({
                assignedTo: req.user.id
            })
                .populate('assignedTo', 'name email role')
                .populate('projectId', 'title')
                .sort({ createdAt: -1 });
        }

        else {
            return res.status(403).json({
                message: 'Access denied.'
            });
        }

        res.status(200).json(tasks);

    } catch (error) {
        console.error('Get Tasks Error:', error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// ======================================================
// GET SINGLE TASK
// ======================================================
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email role')
            .populate('projectId', 'title');

        if (!task) {
            return res.status(404).json({
                message: 'Task not found.'
            });
        }

        // Admin / PM can view any task
        if (
            req.user.role === 'Admin' ||
            req.user.role === 'Project Manager'
        ) {
            return res.status(200).json(task);
        }

        // Developer can only view their own assigned task
        if (
            req.user.role === 'Developer' &&
            task.assignedTo &&
            task.assignedTo._id.toString() === req.user.id
        ) {
            return res.status(200).json(task);
        }

        return res.status(403).json({
            message: 'Access denied. You are not assigned to this task.'
        });

    } catch (error) {
        console.error('Get Task Error:', error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// ======================================================
// UPDATE TASK
// Admin / PM → Can update task details
// Developer → Can update STATUS only on own task
// ======================================================
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: 'Task not found.'
            });
        }

        // ==========================================
        // ADMIN / PROJECT MANAGER
        // ==========================================
        if (
            req.user.role === 'Admin' ||
            req.user.role === 'Project Manager'
        ) {
            const {
                title,
                description,
                status,
                priority,
                dueDate,
                projectId,
                assignedTo
            } = req.body;

            if (title !== undefined) task.title = title;
            if (description !== undefined) task.description = description;
            if (status !== undefined) task.status = status;
            if (priority !== undefined) task.priority = priority;
            if (dueDate !== undefined) task.dueDate = dueDate;
            if (projectId !== undefined) task.projectId = projectId;
            if (assignedTo !== undefined) task.assignedTo = assignedTo;

            const updatedTask = await task.save();

            return res.status(200).json({
                message: 'Task updated successfully',
                task: updatedTask
            });
        }


        // ==========================================
        // DEVELOPER
        // STATUS ONLY
        // ==========================================
        if (req.user.role === 'Developer') {

            // Check ownership
            if (
                !task.assignedTo ||
                task.assignedTo.toString() !== req.user.id
            ) {
                return res.status(403).json({
                    message: 'Access denied. You can only update your assigned tasks.'
                });
            }

            // Developer can ONLY update status
            if (
                Object.keys(req.body).some(
                    key => key !== 'status'
                )
            ) {
                return res.status(403).json({
                    message: 'Developers can only update task status.'
                });
            }

            if (!req.body.status) {
                return res.status(400).json({
                    message: 'Status is required.'
                });
            }

            task.status = req.body.status;

            const updatedTask = await task.save();

            return res.status(200).json({
                message: 'Task status updated successfully',
                task: updatedTask
            });
        }


        return res.status(403).json({
            message: 'Access denied.'
        });

    } catch (error) {
        console.error('Update Task Error:', error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// ======================================================
// DELETE TASK
// Admin / Project Manager ONLY
// ======================================================
const deleteTask = async (req, res) => {
    try {
        if (
            req.user.role !== 'Admin' &&
            req.user.role !== 'Project Manager'
        ) {
            return res.status(403).json({
                message: 'Access denied. Only Admin or Project Manager can delete tasks.'
            });
        }

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: 'Task not found.'
            });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Task deleted successfully'
        });

    } catch (error) {
        console.error('Delete Task Error:', error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};