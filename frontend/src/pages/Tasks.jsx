import { useEffect, useState } from 'react';
import {
    getTasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    getProjects,
    getUsers
} from '../services/api';

function Tasks() {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [projectId, setProjectId] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [selectedProjectFilter, setSelectedProjectFilter] = useState('');
    const [selectedUserFilter, setSelectedUserFilter] = useState('');
    const [viewMode, setViewMode] = useState('kanban');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            const [tasksData, projectsData, usersData] =
                await Promise.all([
                    getTasks(),
                    getProjects(),
                    getUsers()
                ]);

            setTasks(tasksData);
            setProjects(projectsData);
            setUsers(usersData);
        } catch (error) {
            console.error('Load Tasks Data Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Please enter task title.');
            return;
        }

        if (!projectId) {
            alert('Please select a project.');
            return;
        }

        if (!assignedTo) {
            alert('Please assign the task to a user.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await createTask({
                title,
                description,
                priority,
                dueDate: dueDate || undefined,
                assignedTo,
                projectId
            });

            alert('Task created successfully!');

            clearForm();
            await loadData();
        } catch (error) {
            console.error('Create Task Error:', error);
            setError(error.message);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateTaskStatus(id, status);
            await loadData();
        } catch (error) {
            console.error('Update Task Status Error:', error);
            setError(error.message);
            alert(error.message);
        }
    };

    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('text/plain', taskId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
            await handleStatusChange(taskId, newStatus);
        }
    };

    const handleDeleteTask = async (id, title) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${title}"?`
        );

        if (!confirmDelete) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            await deleteTask(id);

            alert('Task deleted successfully!');
            await loadData();
        } catch (error) {
            console.error('Delete Task Error:', error);
            setError(error.message);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setTitle('');
        setDescription('');
        setPriority('Medium');
        setDueDate('');
        setAssignedTo('');
        setProjectId('');
    };

    const filteredTasks = tasks.filter((task) => {
        const matchesProject = !selectedProjectFilter || 
            (task.projectId && (task.projectId._id === selectedProjectFilter || task.projectId === selectedProjectFilter));
        const matchesUser = !selectedUserFilter || 
            (task.assignedTo && (task.assignedTo._id === selectedUserFilter || task.assignedTo === selectedUserFilter));
        return matchesProject && matchesUser;
    });

    return (
        <div className="tasks-page">
            <div className="page-header">
                <div>
                    <h1>Tasks</h1>
                    <p>Create, assign and manage tasks</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* View Mode Toggle */}
                    <div style={{ display: 'flex', background: 'var(--border-color)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                        <button 
                            className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                            onClick={() => setViewMode('kanban')}
                            style={{ 
                                padding: '6px 14px', 
                                border: 'none', 
                                background: viewMode === 'kanban' ? 'white' : 'transparent',
                                color: viewMode === 'kanban' ? 'var(--primary)' : 'var(--text-secondary)',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                boxShadow: viewMode === 'kanban' ? 'var(--shadow-sm)' : 'none'
                            }}
                        >
                            Kanban Board
                        </button>
                        <button 
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            style={{ 
                                padding: '6px 14px', 
                                border: 'none', 
                                background: viewMode === 'list' ? 'white' : 'transparent',
                                color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-secondary)',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none'
                            }}
                        >
                            List View
                        </button>
                    </div>

                    {currentUser.role !== 'Developer' && (
                        <button 
                            className="btn-primary"
                            onClick={() => setShowCreateModal(true)}
                            style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                            + New Task
                        </button>
                    )}

                    <div className="task-count">
                        {filteredTasks.length} Tasks
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="filters-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Project:</span>
                    <select 
                        value={selectedProjectFilter} 
                        onChange={(e) => setSelectedProjectFilter(e.target.value)}
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                    >
                        <option value="">All Projects</option>
                        {projects.map(p => (
                            <option key={p._id} value={p._id}>{p.title}</option>
                        ))}
                    </select>
                </div>

                {currentUser.role !== 'Developer' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Assigned To:</span>
                        <select 
                            value={selectedUserFilter} 
                            onChange={(e) => setSelectedUserFilter(e.target.value)}
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                            <option value="">All Users</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Kanban Board View */}
            {viewMode === 'kanban' && (
                <div className="kanban-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', overflowX: 'auto', paddingBottom: '16px' }}>
                    {['To Do', 'In Progress', 'In Review', 'Done'].map((status) => {
                        const statusTasks = filteredTasks.filter(t => t.status === status);
                        let columnColor = '#4f46e5'; 
                        if (status === 'In Progress') columnColor = '#f59e0b'; 
                        if (status === 'In Review') columnColor = '#8b5cf6'; 
                        if (status === 'Done') columnColor = '#10b981'; 

                        return (
                            <div 
                                key={status}
                                className="kanban-column"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, status)}
                                style={{ 
                                    background: 'var(--bg-card)', 
                                    borderRadius: 'var(--radius-lg)', 
                                    border: '1px solid var(--border-color)',
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    minHeight: '500px',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${columnColor}`, paddingBottom: '8px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{status}</h3>
                                    <span style={{ fontSize: '11px', background: 'var(--bg-app)', padding: '2px 8px', borderRadius: '99px', fontWeight: '700', color: 'var(--text-secondary)' }}>{statusTasks.length}</span>
                                </div>

                                <div className="kanban-tasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                                    {statusTasks.length === 0 ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '12px' }}>
                                            Drag tasks here
                                        </div>
                                    ) : (
                                        statusTasks.map(task => (
                                            <div 
                                                key={task._id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task._id)}
                                                className="kanban-card"
                                                style={{ 
                                                    background: 'var(--bg-app)', 
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: 'var(--radius-md)',
                                                    padding: '14px',
                                                    cursor: 'grab',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                    boxShadow: 'var(--shadow-sm)',
                                                    transition: 'var(--transition)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span className={`badge badge-${task.priority?.toLowerCase() || 'medium'}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                                                        {task.priority}
                                                    </span>
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                        {task.projectId?.title || 'No Project'}
                                                    </span>
                                                </div>

                                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                                                    {task.title}
                                                </h4>

                                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4', minHeight: '30px' }}>
                                                    {task.description || 'No description.'}
                                                </p>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '8px', marginTop: '4px' }}>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</span>
                                                        <select
                                                            value={task.status}
                                                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                            style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                                        >
                                                            <option value="To Do">To Do</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="In Review">In Review</option>
                                                            <option value="Done">Done</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: '11px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                                                        <div className="topbar-avatar" style={{ width: '16px', height: '16px', fontSize: '8px' }}>
                                                            {task.assignedTo?.name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        {task.assignedTo?.name || 'Unassigned'}
                                                    </span>

                                                    {currentUser.role !== 'Developer' && (
                                                        <button 
                                                            onClick={() => handleDeleteTask(task._id, task.title)}
                                                            style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600 }}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className={`project-layout ${currentUser.role === 'Developer' ? 'developer-layout' : ''}`}>
                    
                    {/* Form Column */}
                    {currentUser.role !== 'Developer' && (
                        <div className="project-form-card">
                            <div className="card-header">
                                <div>
                                    <h2>Create New Task</h2>
                                    <p>Add a new task assignment</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateTask}>
                                <div className="form-group">
                                    <label>Task Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter task title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Task Description"
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        rows="3"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Priority</label>
                                        <select
                                            value={priority}
                                            onChange={(e) =>
                                                setPriority(e.target.value)
                                            }
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Due Date</label>
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) =>
                                                setDueDate(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Project</label>
                                    <select
                                        value={projectId}
                                        onChange={(e) =>
                                            setProjectId(e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select Project
                                        </option>

                                        {projects.map((project) => (
                                            <option
                                                key={project._id}
                                                value={project._id}
                                            >
                                                {project.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group" style={{ marginBottom: '24px' }}>
                                    <label>Assign To</label>
                                    <select
                                        value={assignedTo}
                                        onChange={(e) =>
                                            setAssignedTo(e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select User
                                        </option>

                                        {users
                                            .filter(
                                                (user) =>
                                                    user.role === 'Developer' ||
                                                    user.role === 'Project Manager'
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
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Create Task'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Tasks List Card */}
                    <div className="projects-list-card">
                        <div className="card-header">
                            <div>
                                <h2>Tasks Board</h2>
                                <p>Manage your existing tasks</p>
                            </div>
                        </div>

                        {loading && filteredTasks.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '12px' }}>
                                <div style={{ width: '30px', height: '30px', border: '3px solid rgba(79,70,229,0.1)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Loading tasks...</p>
                            </div>
                        )}

                        {!loading && filteredTasks.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-icon">✓</div>
                                <h3>No tasks found</h3>
                                <p>Create tasks or adjust filters to populate this area.</p>
                            </div>
                        )}

                        {!loading && filteredTasks.length > 0 && (
                            <div className="projects-grid">
                                {filteredTasks.map((task) => {
                                    const priorityClass = `badge badge-${task.priority?.toLowerCase() || 'medium'}`;
                                    return (
                                        <div className="project-card" key={task._id} style={{ gap: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <span className={priorityClass}>
                                                    <span className="badge-dot"></span>
                                                    {task.priority}
                                                </span>
                                                <span className="project-status" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                                                    {task.projectId?.title || 'No Project'}
                                                </span>
                                            </div>

                                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: '4px 0 0' }}>
                                                {task.title}
                                            </h3>

                                            <p className="project-description" style={{ height: 'auto', minHeight: '40px', fontSize: '13px', margin: 0 }}>
                                                {task.description || 'No description provided.'}
                                            </p>

                                            <div className="project-creator" style={{ paddingBottom: '0', borderBottom: 'none', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned To</span>
                                                    <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                                        <div className="topbar-avatar" style={{ width: '18px', height: '18px', fontSize: '9px' }}>
                                                            {task.assignedTo?.name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        {task.assignedTo?.name || 'Not assigned'}
                                                    </strong>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Due Date</span>
                                                    <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                                        </svg>
                                                        {task.dueDate ? task.dueDate.substring(0, 10) : 'Not set'}
                                                    </strong>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Status</span>
                                                    <select
                                                        value={task.status}
                                                        onChange={(e) =>
                                                            handleStatusChange(
                                                                task._id,
                                                                e.target.value
                                                            )
                                                        }
                                                        style={{ padding: '6px 10px', fontSize: '13px' }}
                                                    >
                                                        <option value="To Do">
                                                            To Do
                                                        </option>

                                                        <option value="In Progress">
                                                            In Progress
                                                        </option>

                                                        <option value="In Review">
                                                            In Review
                                                        </option>

                                                        <option value="Done">
                                                            Done
                                                        </option>
                                                    </select>
                                                </div>

                                                {currentUser.role !== 'Developer' && (
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() =>
                                                            handleDeleteTask(
                                                                task._id,
                                                                task.title
                                                            )
                                                        }
                                                        style={{ marginTop: '18px', padding: '7px 12px' }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: 'white', borderRadius: 'var(--radius-lg)', width: '450px', padding: '30px', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
                        <button onClick={() => setShowCreateModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Create New Task</h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>Add a new task assignment to the workspace</p>
                        
                        <form onSubmit={async (e) => {
                            await handleCreateTask(e);
                            setShowCreateModal(false);
                        }}>
                            <div className="form-group">
                                <label>Task Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter task title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Task Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Project</label>
                                <select
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Project</option>
                                    {projects.map((project) => (
                                        <option key={project._id} value={project._id}>
                                            {project.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label>Assign To</label>
                                <select
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                    required
                                >
                                    <option value="">Select User</option>
                                    {users
                                        .filter(
                                            (user) =>
                                                user.role === 'Developer' ||
                                                user.role === 'Project Manager'
                                        )
                                        .map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name} - {user.role}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ width: '100%', padding: '12px' }}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Create Task'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tasks;