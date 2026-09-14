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

            const [tasksData, projectsData, usersData] = await Promise.all([
                getTasks(),
                getProjects(),
                getUsers()
            ]);

            setTasks(tasksData || []);
            setProjects(projectsData || []);
            setUsers(usersData || []);
        } catch (err) {
            console.error('Load Tasks Data Error:', err);
            setError(err.message || 'Failed to load data');
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

            const newTask = await createTask({
                title,
                description,
                priority,
                dueDate: dueDate || undefined,
                assignedTo,
                projectId
            });

            alert('Task created successfully!');
            clearForm();
            setShowCreateModal(false);
            
            // Append newly created task locally or re-fetch
            if (newTask && newTask._id) {
                setTasks((prev) => [newTask, ...prev]);
            } else {
                await loadData();
            }
        } catch (err) {
            console.error('Create Task Error:', err);
            setError(err.message);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        // Optimistic UI update
        const previousTasks = [...tasks];
        setTasks((prev) =>
            prev.map((t) => (t._id === id ? { ...t, status } : t))
        );

        try {
            await updateTaskStatus(id, status);
        } catch (err) {
            console.error('Update Task Status Error:', err);
            setTasks(previousTasks); // Rollback on failure
            setError(err.message);
            alert(err.message);
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

    const handleDeleteTask = async (id, taskTitle) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${taskTitle}"?`
        );

        if (!confirmDelete) return;

        try {
            setLoading(true);
            setError('');

            await deleteTask(id);
            setTasks((prev) => prev.filter((t) => t._id !== id));
            alert('Task deleted successfully!');
        } catch (err) {
            console.error('Delete Task Error:', err);
            setError(err.message);
            alert(err.message);
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
        const matchesProject =
            !selectedProjectFilter ||
            (task.projectId &&
                (task.projectId._id === selectedProjectFilter ||
                    task.projectId === selectedProjectFilter));
        const matchesUser =
            !selectedUserFilter ||
            (task.assignedTo &&
                (task.assignedTo._id === selectedUserFilter ||
                    task.assignedTo === selectedUserFilter));
        return matchesProject && matchesUser;
    });

    return (
        <div className="tasks-page">
            {/* Page Header */}
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
            <div className="filters-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Project:</span>
                    <select
                        value={selectedProjectFilter}
                        onChange={(e) => setSelectedProjectFilter(e.target.value)}
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                    >
                        <option value="">All Projects</option>
                        {projects.map((p) => (
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
                            {users.map((u) => (
                                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message" style={{ color: 'var(--danger)', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {/* Kanban Board View */}
            {viewMode === 'kanban' && (
                <div className="kanban-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', overflowX: 'auto', paddingBottom: '16px' }}>
                    {['To Do', 'In Progress', 'In Review', 'Done'].map((status) => {
                        const statusTasks = filteredTasks.filter((t) => t.status === status);
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
                                        statusTasks.map((task) => (
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
                            <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                {filteredTasks.map((task) => {
                                    const priorityClass = `badge badge-${task.priority?.toLowerCase() || 'medium'}`;
                                    return (
                                        <div className="project-card" key={task._id} style={{ gap: '12px', background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <span className={priorityClass}>
                                                    <span className="badge-dot"></span>
                                                    {task.priority}
                                                </span>
                                                <span className="project-status" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                                                    {task.projectId?.title || 'No Project'}
                                                </span>
                                            </div>

                                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: '8px 0 0' }}>
                                                {task.title}
                                            </h3>

                                            <p className="project-description" style={{ height: 'auto', minHeight: '40px', fontSize: '13px', margin: '4px 0', color: 'var(--text-secondary)' }}>
                                                {task.description || 'No description provided.'}
                                            </p>

                                            <div className="project-creator" style={{ paddingBottom: '0', borderBottom: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                                                    <span style={{ fontSize: '12px', fontWeight: '600' }}>
                                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '6px' }}>
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

                                                    {currentUser.role !== 'Developer' && (
                                                        <button
                                                            onClick={() => handleDeleteTask(task._id, task.title)}
                                                            style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal for Creating New Task */}
            {showCreateModal && (() => {
                const selectedProject = projects.find((p) => String(p._id) === String(projectId));
                const projectMembers = selectedProject && Array.isArray(selectedProject.members)
                    ? selectedProject.members
                        .map((m) => (typeof m === 'object' && m ? m : users.find((u) => String(u._id) === String(m))))
                        .filter(Boolean)
                    : [];

                return (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div className="modal-content" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '18px', margin: 0 }}>Create New Task</h2>
                                <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                            </div>

                            <form onSubmit={handleCreateTask}>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Task Title *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter task title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Description</label>
                                    <textarea
                                        placeholder="Enter task description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="3"
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Project *</label>
                                        <select
                                            value={projectId}
                                            onChange={(e) => {
                                                setProjectId(e.target.value);
                                                setAssignedTo('');
                                            }}
                                            required
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map((p) => (
                                                <option key={p._id} value={p._id}>{p.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Assignee *</label>
                                        <select
                                            value={assignedTo}
                                            onChange={(e) => setAssignedTo(e.target.value)}
                                            required
                                            disabled={!projectId}
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                        >
                                            <option value="">
                                                {!projectId
                                                    ? 'Select Project First'
                                                    : projectMembers.length === 0
                                                    ? 'No members in this project'
                                                    : 'Select User'}
                                            </option>
                                            {projectMembers.map((u) => (
                                                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Priority</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Due Date</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    {loading ? 'Creating...' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ); })()}
        </div>
    );
}

export default Tasks;