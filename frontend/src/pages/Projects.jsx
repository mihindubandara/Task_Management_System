import { useEffect, useState } from 'react';
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    getUsers
} from '../services/api';

function Projects() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [members, setMembers] = useState([]);

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadProjects();
        loadUsers();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await getProjects();
            setProjects(data);
        } catch (error) {
            console.error('Get Projects Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Get Users Error:', error);
        }
    };

    const handleSaveProject = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Please enter project title.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const user = JSON.parse(localStorage.getItem('user'));

            if (!user || !user.id) {
                alert('Please login first.');
                return;
            }

            const projectData = {
                title,
                description,
                startDate,
                endDate,
                members,
                createdBy: user.id
            };

            if (editingId) {
                await updateProject(editingId, projectData);
                alert('Project updated successfully!');
            } else {
                await createProject(projectData);
                alert('Project created successfully!');
            }

            clearForm();
            await loadProjects();
        } catch (error) {
            console.error('Save Project Error:', error);
            setError(error.message);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = async (id) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this project?'
        );

        if (!confirmDelete) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            await deleteProject(id);

            alert('Project deleted successfully!');
            await loadProjects();
        } catch (error) {
            console.error('Delete Project Error:', error);
            setError(error.message);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProject = (project) => {
        setEditingId(project._id);
        setTitle(project.title || '');
        setDescription(project.description || '');

        setStartDate(
            project.startDate
                ? project.startDate.substring(0, 10)
                : ''
        );

        setEndDate(
            project.endDate
                ? project.endDate.substring(0, 10)
                : ''
        );

        setMembers(
            project.members
                ? project.members.map(
                      (member) => member._id || member
                  )
                : []
        );
    };

    const handleMemberChange = (e) => {
        const selectedMembers = Array.from(
            e.target.selectedOptions,
            (option) => option.value
        );

        setMembers(selectedMembers);
    };

    const clearForm = () => {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setMembers([]);
    };

    return (
        <div className="projects-page">

            <div className="page-header">
                <div>
                    <h1>Projects</h1>
                    <p>
                        Create, manage and track your projects
                    </p>
                </div>

                <div className="project-count">
                    {projects.length} Projects
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className={`project-layout ${currentUser.role === 'Developer' ? 'developer-layout' : ''}`}>

                {currentUser.role !== 'Developer' && (
                    <div className="project-form-card">

                        <div className="card-header">
                        <div>
                            <h2>
                                {editingId
                                    ? 'Edit Project'
                                    : 'Create New Project'}
                            </h2>

                            <p>
                                {editingId
                                    ? 'Update project information'
                                    : 'Add a new project to your workspace'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveProject}>

                        <div className="form-group">
                            <label>Project Title</label>

                            <input
                                type="text"
                                placeholder="Enter project title"
                                value={title}
                                onChange={(e) =>
                                    setTitle(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>

                            <textarea
                                placeholder="Describe your project..."
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                rows="4"
                            />
                        </div>

                        <div className="form-row">

                            <div className="form-group">
                                <label>Start Date</label>

                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label>End Date</label>

                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) =>
                                        setEndDate(
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                        </div>

                        <div className="form-group">
                            <label>Project Members</label>

                            <select
                                multiple
                                value={members}
                                onChange={handleMemberChange}
                            >
                                {users
                                    .filter(
                                        (user) =>
                                            user.role ===
                                                'Developer' ||
                                            user.role ===
                                                'Project Manager'
                                    )
                                    .map((user) => (
                                        <option
                                            key={user._id}
                                            value={user._id}
                                        >
                                            {user.name} - {user.role}
                                        </option>
                                    ))}
                            </select>

                            <small>
                                Hold Ctrl and select multiple members
                            </small>
                        </div>

                        <div className="form-actions">

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Processing...'
                                    : editingId
                                        ? 'Update Project'
                                        : 'Create Project'}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={clearForm}
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>
                </div>
                )}

                <div className="projects-list-card">

                    <div className="card-header">
                        <div>
                            <h2>All Projects</h2>
                            <p>
                                Manage your existing projects
                            </p>
                        </div>
                    </div>

                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '12px' }}>
                            <div style={{ width: '30px', height: '30px', border: '3px solid rgba(79,70,229,0.1)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Loading projects...</p>
                        </div>
                    )}

                    {!loading && projects.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </div>

                            <h3>No projects yet</h3>

                            <p>
                                Create your first project using
                                the form.
                            </p>
                        </div>
                    )}

                    {!loading && projects.length > 0 && (
                        <div className="projects-grid">

                            {projects.map((project) => (
                                <div
                                    className="project-card"
                                    key={project._id}
                                >

                                    <div className="project-card-top">

                                        <div>
                                            <h3>
                                                {project.title}
                                            </h3>

                                            <span className="project-status">
                                                Active
                                            </span>
                                        </div>

                                    </div>

                                    <p className="project-description">
                                        {project.description ||
                                            'No description'}
                                    </p>

                                    <div className="project-info">

                                        <div className="info-item">
                                            <span>
                                                Start Date
                                            </span>

                                            <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                                {project.startDate
                                                    ? project.startDate.substring(
                                                          0,
                                                          10
                                                      )
                                                    : 'Not set'}
                                            </strong>
                                        </div>

                                        <div className="info-item">
                                            <span>
                                                End Date
                                            </span>

                                            <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                                {project.endDate
                                                    ? project.endDate.substring(
                                                          0,
                                                          10
                                                      )
                                                    : 'Not set'}
                                            </strong>
                                        </div>

                                    </div>

                                    <div className="project-creator">
                                        <span>
                                            Created By
                                        </span>

                                        <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div className="topbar-avatar" style={{ width: '18px', height: '18px', fontSize: '9px' }}>
                                                {project.createdBy?.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            {project.createdBy?.name || 'Unknown'}
                                        </strong>
                                    </div>

                                    <div className="project-members">

                                        <span>
                                            Members
                                        </span>

                                        <div className="member-list">
                                            {project.members?.length
                                                ? project.members.map(
                                                      (member) => (
                                                          <span
                                                              className="member-tag"
                                                              key={
                                                                  member._id
                                                              }
                                                          >
                                                              {member.name}
                                                          </span>
                                                      )
                                                  )
                                                : (
                                                    <span className="no-members">
                                                        No members
                                                    </span>
                                                )}
                                        </div>

                                    </div>

                                    {currentUser.role !== 'Developer' && (
                                        <div className="project-actions">

                                            <button
                                                className="btn-edit"
                                                onClick={() =>
                                                    handleEditProject(
                                                        project
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            {currentUser.role === 'Admin' && (
                                                <button
                                                    className="btn-delete"
                                                    onClick={() =>
                                                        handleDeleteProject(
                                                            project._id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            )}

                                        </div>
                                    )}

                                </div>
                            ))}

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}

export default Projects;