import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import './Sidebar.css';

const navItems = [
    { path: '/dashboard', label: 'Platform overview', icon: '◫' },
    { path: '/providers', label: 'Provider verification', icon: '✓' },
    { path: '/users', label: 'Users & access', icon: '◎' },
    { path: '/work-posts', label: 'Work-post moderation', icon: '▤' },
    { path: '/issues', label: 'Issues & incidents', icon: '!' },
    { path: '/reports', label: 'Platform reports', icon: '▥' },
    { path: '/activity-logs', label: 'Activity log', icon: '◷' },
    { path: '/settings', label: 'Settings & fees', icon: '⚙' },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavClick = () => {
        // Close sidebar on mobile when clicking a nav item
        if (window.innerWidth <= 768 && collapsed) {
            setCollapsed(false);
        }
    };

    const handleOverlayClick = () => {
        // Close sidebar when clicking overlay on mobile
        if (window.innerWidth <= 768 && collapsed) {
            setCollapsed(false);
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            {collapsed && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    onClick={handleOverlayClick}
                    aria-label="Close navigation"
                />
            )}
            <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
                <div className="sidebar__header">
                    <div className="sidebar__brand">
                        <span className="sidebar__logo" aria-hidden="true">S</span>
                        <span className="sidebar__title">SBMS Admin</span>
                    </div>
                    <button
                        className="sidebar__toggle"
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? 'Expand' : 'Collapse'}
                        aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
                    >
                        {collapsed ? '→' : '←'}
                    </button>
                </div>

                <nav className="sidebar__nav">
                    {navItems.map(({ path, label, icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
                            }
                            onClick={handleNavClick}
                            aria-label={label}
                        >
                            <span className="sidebar__nav-icon">{icon}</span>
                            <span className="sidebar__nav-label">{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar__footer">
                    <div className="sidebar__user">
                        <div className="sidebar__avatar">{user?.fullName?.[0] || 'A'}</div>
                        <div className="sidebar__user-info">
                            <p className="sidebar__user-name">{user?.fullName}</p>
                            <p className="sidebar__user-role">{user?.role}</p>
                        </div>
                    </div>
                    <button className="sidebar__logout" onClick={handleLogout} title="Logout">
                        ↪ <span>Sign out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
