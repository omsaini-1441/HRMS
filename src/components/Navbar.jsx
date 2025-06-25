import React from 'react';
import { Search, Bell, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/dashboard.css';

function Navbar({ title }) {
  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="navbar-center">{title}</div>
        <div className="navbar-right">
          <div style={{ position: 'relative' }}>
            <Mail size={18} />
            <span className="icon-dot"></span>
          </div>
          <div style={{ position: 'relative' }}>
            <Bell size={18} />
            <span className="icon-dot"></span>
          </div>
          <div className="profile-dropdown">
            <div className="profile-icon"></div>
            <div className="profile-dropdown-content">
              <a href="#">Profile</a>
              <a href="#">Settings</a>
              <a href="/logout">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;