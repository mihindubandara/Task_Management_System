import { useEffect, useState } from 'react';
import {
    getUsers,
    createUser,
    deleteUser
} from '../services/api';

function Users() {
    const [users, setUsers] = useState([]);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Developer');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load users
    const loadUsers = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await getUsers();

            setUsers(data);
        } catch (error) {
            console.error('Get Users Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Load users when page opens
    useEffect(() => {
        loadUsers();
    }, []);

    // Add user
    const handleCreateUser = async (e) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !password.trim()) {
            alert('Please fill all fields.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await createUser({
                name,
                email,
                password,
                role
            });

            alert(`${role} created successfully!`);

            setName('');
            setEmail('');
            setPassword('');
            setRole('Developer');

            await loadUsers();
        } catch (error) {
            console.error('Create User Error:', error);
            setError(error.message);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete user
    const handleDeleteUser = async (id, userName, userRole) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to remove ${userName} (${userRole})?`
        );

        if (!confirmDelete) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            await deleteUser(id);

            alert('User removed successfully!');

            await loadUsers();
        } catch (error) {
            console.error('Delete User Error:', error);
            setError(error.message);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="users-page-layout">
            <div className="page-header">
                <div>
                    <h1>Users</h1>
                    <p>Manage Developers and Project Managers</p>
                </div>

                <div className="project-count">
                    {users.length} Users
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="project-layout">

                {/* Form Column */}
                <div className="project-form-card">
                    <div className="card-header">
                        <div>
                            <h2>Add User</h2>
                            <p>Register a new member</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateUser}>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label>Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="Developer">
                                    Developer
                                </option>

                                <option value="Project Manager">
                                    Project Manager
                                </option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Add User'}
                        </button>
                    </form>
                </div>

                {/* User List Column */}
                <div className="projects-list-card">
                    <div className="card-header">
                        <div>
                            <h2>Team Members</h2>
                            <p>Current active workspace members</p>
                        </div>
                    </div>

                    {loading && users.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '12px' }}>
                            <div style={{ width: '30px', height: '30px', border: '3px solid rgba(79,70,229,0.1)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>Loading users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <h3>No users found</h3>
                            <p>Use the form to add your team members.</p>
                        </div>
                    ) : (
                        <div className="users-grid">
                            {users.map((user) => {
                                const roleClass = `badge-role ${user.role === 'Project Manager' ? 'badge-role-pm' : user.role === 'Admin' ? 'badge-role-admin' : ''}`;
                                return (
                                    <div
                                        key={user._id}
                                        className="user-card"
                                    >
                                        <div className="user-card-avatar">
                                            {user.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="user-card-info">
                                            <h4>{user.name}</h4>
                                            <p>{user.email}</p>
                                            <span className={roleClass}>
                                                {user.role}
                                            </span>
                                        </div>

                                        {user.role !== 'Admin' && (
                                            <button
                                                className="btn-delete"
                                                onClick={() =>
                                                    handleDeleteUser(
                                                        user._id,
                                                        user.name,
                                                        user.role
                                                    )
                                                }
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}

export default Users;