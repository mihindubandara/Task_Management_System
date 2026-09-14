const Project = require('../models/Project');

// ======================================================
// CREATE PROJECT
// Admin / Project Manager ONLY
// ======================================================
const createProject = async (req, res) => {
    try {
        const { title, description, startDate, endDate, members } = req.body;

        if (req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
            return res.status(403).json({
                message: 'Access denied. Only Admin or Project Manager can create projects.'
            });
        }

        if (!title || !description) {
            return res.status(400).json({
                message: 'Title and description are required.'
            });
        }

        const project = new Project({
            title,
            description,
            startDate,
            endDate,
            members: members || [],
            createdBy: req.user.id
        });

        const savedProject = await project.save();

        const populatedProject = await Project.findById(savedProject._id)
            .populate('createdBy', 'name email role')
            .populate('members', 'name email role');

        res.status(201).json({
            message: 'Project created successfully',
            project: populatedProject
        });

    } catch (error) {
        console.error('Create Project Error:', error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// ======================================================
// GET PROJECTS
// Admin / PM -> All projects
// Developer -> Assigned projects only
// ======================================================
const getProjects = async (req, res) => {
    try {
        if (req.user.role === 'Admin' || req.user.role === 'Project Manager') {

            const projects = await Project.find()
                .populate('createdBy', 'name email role')
                .populate('members', 'name email role')
                .sort({ createdAt: -1 });

            return res.status(200).json(projects);
        }

        if (req.user.role === 'Developer') {

            const projects = await Project.find({
                members: req.user.id
            })
                .populate('createdBy', 'name email role')
                .populate('members', 'name email role')
                .sort({ createdAt: -1 });

            return res.status(200).json(projects);
        }

        return res.status(403).json({
            message: 'Access denied.'
        });

    } catch (error) {
        console.error('Get Projects Error:', error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// ======================================================
// GET SINGLE PROJECT
// ======================================================
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('createdBy', 'name email role')
            .populate('members', 'name email role');

        if (!project) {
            return res.status(404).json({
                message: 'Project not found.'
            });
        }

        if (
            req.user.role === 'Admin' ||
            req.user.role === 'Project Manager'
        ) {
            return res.status(200).json(project);
        }

        const isMember = project.members.some(
            member => member._id.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                message: 'Access denied. You are not a member of this project.'
            });
        }

        res.status(200).json(project);

    } catch (error) {
        console.error('Get Project Error:', error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// ======================================================
// UPDATE PROJECT
// Admin / Project Manager ONLY
// ======================================================
const updateProject = async (req, res) => {
    try {
        if (
            req.user.role !== 'Admin' &&
            req.user.role !== 'Project Manager'
        ) {
            return res.status(403).json({
                message: 'Access denied. Only Admin or Project Manager can update projects.'
            });
        }

        const { title, description, startDate, endDate, members } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: 'Project not found.'
            });
        }

        if (title !== undefined) project.title = title;
        if (description !== undefined) project.description = description;
        if (startDate !== undefined) project.startDate = startDate;
        if (endDate !== undefined) project.endDate = endDate;
        if (members !== undefined) project.members = members;

        const savedProject = await project.save();

        const populatedProject = await Project.findById(savedProject._id)
            .populate('createdBy', 'name email role')
            .populate('members', 'name email role');

        res.status(200).json({
            message: 'Project updated successfully',
            project: populatedProject
        });

    } catch (error) {
        console.error('Update Project Error:', error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// ======================================================
// DELETE PROJECT
// Admin / Project Manager ONLY
// ======================================================
const deleteProject = async (req, res) => {
    try {
        if (
            req.user.role !== 'Admin' &&
            req.user.role !== 'Project Manager'
        ) {
            return res.status(403).json({
                message: 'Access denied. Only Admin or Project Manager can delete projects.'
            });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: 'Project not found.'
            });
        }

        await Project.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Project deleted successfully'
        });

    } catch (error) {
        console.error('Delete Project Error:', error);

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
};