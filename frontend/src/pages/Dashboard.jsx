import { useEffect, useState } from 'react';
import {
    getProjects,
    getTasks,
    getUsers
} from '../services/api';

function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const user = JSON.parse(
        localStorage.getItem('user')
    );

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError('');

            const tasksData = await getTasks();

            setTasks(tasksData);

            if (
                user?.role === 'Admin' ||
                user?.role === 'Project Manager'
            ) {
                const projectsData = await getProjects();

                setProjects(projectsData);
            }

            if (user?.role === 'Admin') {
                const usersData = await getUsers();

                setUsers(usersData);
            }

        } catch (error) {
            console.error(
                'Dashboard Load Error:',
                error
            );

            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(79,70,229,0.1)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Loading your dashboard analytics...</p>
            </div>
        );
    }

    const completedTasks = tasks.filter(
        (task) => task.status === 'Done'
    ).length;

    const pendingTasks = tasks.filter(
        (task) => task.status !== 'Done'
    ).length;

    const developers = users.filter(
        (user) => user.role === 'Developer'
    ).length;

    const projectManagers = users.filter(
        (user) => user.role === 'Project Manager'
    ).length;

    return (
        <div className="dashboard-page">
            <div className="dashboard-welcome">
                <div className="dashboard-welcome-text">
                    <h2>Welcome back, {user?.name}!</h2>
                    <p>Here is what's happening with your workspace projects and tasks today.</p>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="dashboard-grid">

                <div className="dashboard-stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(79, 70, 229, 0.08)', color: '#4f46e5' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"/>
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                        </svg>
                    </div>
                    <div className="stat-info">
                        <h3>Total Tasks</h3>
                        <p>{tasks.length}</p>
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <div className="stat-info">
                        <h3>Completed</h3>
                        <p>{completedTasks}</p>
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div className="stat-info">
                        <h3>Pending Tasks</h3>
                        <p>{pendingTasks}</p>
                    </div>
                </div>

                {(user?.role === 'Admin' ||
                    user?.role === 'Project Manager') && (
                    <div className="dashboard-stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Total Projects</h3>
                            <p>{projects.length}</p>
                        </div>
                    </div>
                )}

                {user?.role === 'Admin' && (
                    <>
                        <div className="dashboard-stat-card">
                            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(20, 184, 166, 0.08)', color: '#14b8a6' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h3>Developers</h3>
                                <p>{developers}</p>
                            </div>
                        </div>

                        <div className="dashboard-stat-card">
                            <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(217, 119, 6, 0.08)', color: '#d97706' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M22 22v-4a5 5 0 0 0-3-4.5"/>
                                    <path d="m17 7-3-3"/>
                                    <path d="m14 10-3-3"/>
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h3>Project PMs</h3>
                                <p>{projectManagers}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;