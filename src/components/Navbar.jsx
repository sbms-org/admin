import React from 'react';
import { useLocation } from 'react-router-dom';
import './Navbar.css';

const pageTitles = {
    '/dashboard': 'Platform overview',
    '/providers': 'Provider verification',
    '/users': 'Users & access',
    '/work-posts': 'Work-post moderation',
    '/issues': 'Issues & incidents',
    '/reports': 'Platform reports',
    '/activity-logs': 'Activity log',
    '/settings': 'Settings & fees',
};

const Navbar = ({ onMenuClick }) => {
    const { pathname } = useLocation();
    const title = pageTitles[pathname] || 'Admin Panel';
    const now = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <header className="navbar">
            <div className="navbar__left">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="navbar__menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
                        ☰
                    </button>
                    <div>
                        <h1 className="navbar__title">{title}</h1>
                        <p className="navbar__date">{now}</p>
                    </div>
                </div>
            </div>
            <div className="navbar__right">
                <div className="navbar__badge">
                    <span className="navbar__badge-dot" aria-hidden="true"></span>
                    SBMS administrator console
                </div>
            </div>
        </header>
    );
};

export default Navbar;
