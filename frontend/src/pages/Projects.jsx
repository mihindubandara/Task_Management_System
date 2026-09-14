import { useEffect, useState } from 'react';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getUsers
} from '../services/api';

const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  members: []
};

function Projects() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const isDeveloper = currentUser.role === 'Developer';
  const isAdmin = currentUser.role === 'Admin';

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projectsData, usersData] = await Promise.all([
        getProjects(),
        getUsers()
      ]);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Data Loading Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 1-Click Add/Remove Member Toggle Logic
  const handleToggleMember = (userId) => {
    const targetId = String(userId);
    setFormData((prev) => {
      const isAlreadyAdded = prev.members.some((id) => String(id) === targetId);
      const updatedMembers = isAlreadyAdded
        ? prev.members.filter((id) => String(id) !== targetId)
        : [...prev.members, targetId];

      return { ...prev, members: updatedMembers };
    });
  };

  const clearForm = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a project title.');
      return;
    }

    if (!currentUser?.id) {
      alert('Please login first.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const projectPayload = {
        ...formData,
        createdBy: currentUser.id
      };

      if (editingId) {
        await updateProject(editingId, projectPayload);
        alert('Project updated successfully!');
      } else {
        await createProject(projectPayload);
        alert('Project created successfully!');
      }

      clearForm();
      await loadData();
    } catch (err) {
      console.error('Save Project Error:', err);
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      setLoading(true);
      setError('');
      await deleteProject(id);
      alert('Project deleted successfully!');
      await loadData();
    } catch (err) {
      console.error('Delete Project Error:', err);
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = (project) => {
    setEditingId(project._id);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      startDate: project.startDate ? project.startDate.substring(0, 10) : '',
      endDate: project.endDate ? project.endDate.substring(0, 10) : '',
      members: project.members ? project.members.map((m) => String(m._id || m)) : []
    });
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Create, manage and track your projects</p>
        </div>
        <div className="project-count">{projects.length} Projects</div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className={`project-layout ${isDeveloper ? 'developer-layout' : ''}`}>
        {!isDeveloper && (
          <div className="project-form-card">
            <div className="card-header">
              <div>
                <h2>{editingId ? 'Edit Project' : 'Create New Project'}</h2>
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
                  name="title"
                  placeholder="Enter project title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Describe your project..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Enhanced Member Multi-Selector (Checkbox controls) */}
              <div className="form-group">
                <label>Project Members (Click to Add / Remove)</label>
                <div
                  className="member-select-container"
                  style={{
                    maxHeight: '180px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    background: '#f8fafc'
                  }}
                >
                  {users
                    .filter(
                      (u) =>
                        u.role === 'Developer' || u.role === 'Project Manager'
                    )
                    .map((user) => {
                      const isSelected = formData.members.some((id) => String(id) === String(user._id));
                      return (
                        <div
                          key={user._id}
                          onClick={() => handleToggleMember(user._id)}
                          style={{
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            border: isSelected
                              ? '1px solid #4f46e5'
                              : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#eef2ff' : '#ffffff',
                            color: isSelected ? '#4338ca' : '#334155',
                            fontWeight: isSelected ? '600' : '400',
                            transition: 'all 0.15s ease',
                            userSelect: 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              style={{ cursor: 'pointer' }}
                            />
                            <span>
                              {user.name} <small style={{ color: '#64748b', fontWeight: 'normal' }}>({user.role})</small>
                            </span>
                          </div>
                          <span style={{ fontSize: '12px' }}>
                            {isSelected ? '✓ Added' : '+ Add'}
                          </span>
                        </div>
                      );
                    })}
                </div>
                <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Select multiple members freely by clicking them.
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
              <p>Manage your existing projects</p>
            </div>
          </div>

          {loading && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  border: '3px solid rgba(79,70,229,0.1)',
                  borderTopColor: '#4f46e5',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Loading projects...
              </p>
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <h3>No projects yet</h3>
              <p>Create your first project using the form.</p>
            </div>
          )}

          {!loading && projects.length > 0 && (
            <div className="projects-grid">
              {projects.map((project) => (
                <div className="project-card" key={project._id}>
                  <div className="project-card-top">
                    <div>
                      <h3>{project.title}</h3>
                      <span className="project-status">Active</span>
                    </div>
                  </div>

                  <p className="project-description">
                    {project.description || 'No description'}
                  </p>

                  <div className="project-info">
                    <div className="info-item">
                      <span>Start Date</span>
                      <strong
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '2px'
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {project.startDate
                          ? project.startDate.substring(0, 10)
                          : 'Not set'}
                      </strong>
                    </div>

                    <div className="info-item">
                      <span>End Date</span>
                      <strong
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '2px'
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {project.endDate
                          ? project.endDate.substring(0, 10)
                          : 'Not set'}
                      </strong>
                    </div>
                  </div>

                  <div className="project-creator">
                    <span>Created By</span>
                    <strong
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <div
                        className="topbar-avatar"
                        style={{
                          width: '18px',
                          height: '18px',
                          fontSize: '9px'
                        }}
                      >
                        {project.createdBy?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      {project.createdBy?.name || 'Unknown'}
                    </strong>
                  </div>

                  <div className="project-members">
                    <span>Members</span>
                    <div className="member-list">
                      {project.members?.length ? (
                        project.members.map((member) => (
                          <span className="member-tag" key={typeof member === 'object' ? member._id : member}>
                            {typeof member === 'object' && member.name
                              ? `${member.name} (${member.role || 'Member'})`
                              : 'User'}
                          </span>
                        ))
                      ) : (
                        <span className="no-members">No members</span>
                      )}
                    </div>
                  </div>

                  {!isDeveloper && (
                    <div className="project-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditProject(project)}
                      >
                        Edit
                      </button>

                      {isAdmin && (
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteProject(project._id)}
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