import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Chat from './pages/Chat';
import './App.css';

function App() {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    const [currentPage, setCurrentPage] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            setCurrentPage('dashboard');
        }
    }, [user]);

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
        setCurrentPage('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);
        setCurrentPage('dashboard');
    };

    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    const isAdmin = user.role === 'Admin';

    const getPageTitle = () => {
        switch (currentPage) {
            case 'dashboard':
                return 'Dashboard';

            case 'projects':
                return 'Projects';

            case 'tasks':
                return 'Tasks';

            case 'users':
                return 'Users';

            case 'chat':
                return 'Chat Box';

            default:
                return 'Dashboard';
        }
    };

    return (
        <div className="app-layout">

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            <aside
                className={`sidebar ${
                    sidebarOpen
                        ? 'sidebar-open'
                        : ''
                }`}
            >
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        TM
                    </div>

                    <div>
                        <h2>TaskFlow</h2>
                        <span>Management System</span>
                    </div>
                </div>

                <nav className="sidebar-nav">

                    <button
                        className={
                            currentPage === 'dashboard'
                                ? 'nav-item active'
                                : 'nav-item'
                        }
                        onClick={() => {
                            setCurrentPage(
                                'dashboard'
                            );
                            setSidebarOpen(false);
                        }}
                    >
                        <span className="nav-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="9" rx="1" />
                                <rect x="14" y="3" width="7" height="5" rx="1" />
                                <rect x="14" y="12" width="7" height="9" rx="1" />
                                <rect x="3" y="16" width="7" height="5" rx="1" />
                            </svg>
                        </span>

                        Dashboard
                    </button>

                    <button
                        className={
                            currentPage === 'projects'
                                ? 'nav-item active'
                                : 'nav-item'
                        }
                        onClick={() => {
                            setCurrentPage(
                                'projects'
                            );
                            setSidebarOpen(false);
                        }}
                    >
                        <span className="nav-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                        </span>

                        Projects
                    </button>

                    <button
                        className={
                            currentPage === 'tasks'
                                ? 'nav-item active'
                                : 'nav-item'
                        }
                        onClick={() => {
                            setCurrentPage(
                                'tasks'
                            );
                            setSidebarOpen(false);
                        }}
                    >
                        <span className="nav-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 11 12 14 22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                        </span>

                        Tasks
                    </button>

                    <button
                        className={
                            currentPage === 'chat'
                                ? 'nav-item active'
                                : 'nav-item'
                        }
                        onClick={() => {
                            setCurrentPage(
                                'chat'
                            );
                            setSidebarOpen(false);
                        }}
                    >
                        <span className="nav-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </span>

                        Chat Box
                    </button>

                    {isAdmin && (
                        <button
                            className={
                                currentPage === 'users'
                                    ? 'nav-item active'
                                    : 'nav-item'
                            }
                            onClick={() => {
                                setCurrentPage(
                                    'users'
                                );
                                setSidebarOpen(false);
                            }}
                        >
                            <span className="nav-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </span>

                            Users
                        </button>
                    )}

                </nav>

                <div className="sidebar-bottom">
                    <div className="user-mini-card">

                        <div className="user-avatar">
                            {user.name
                                ?.charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="user-mini-info">
                            <strong>
                                {user.name}
                            </strong>

                            <span>
                                {user.role}
                            </span>
                        </div>

                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>

            <div className="main-area">

                <header className="topbar">

                    <div className="topbar-left">

                        <button
                            className="menu-button"
                            onClick={() =>
                                setSidebarOpen(
                                    !sidebarOpen
                                )
                            }
                        >
                            ☰
                        </button>

                        <div>
                            <h1>
                                {getPageTitle()}
                            </h1>

                            <p>
                                Manage your work efficiently
                            </p>
                        </div>

                    </div>

                    <div className="topbar-user">

                        <div className="topbar-avatar">
                            {user.name
                                ?.charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                {user.name}
                            </strong>

                            <span>
                                {user.role}
                            </span>
                        </div>

                    </div>

                </header>

                <main className="content">

                    {currentPage === 'dashboard' && (
                        <Dashboard />
                    )}

                    {currentPage === 'projects' && (
                        <Projects />
                    )}

                    {currentPage === 'tasks' && (
                        <Tasks />
                    )}

                    {currentPage === 'chat' && (
                        <Chat />
                    )}

                    {currentPage === 'users' &&
                        isAdmin && (
                            <Users />
                        )}

                </main>

            </div>

        </div>
    );
}

export default App;