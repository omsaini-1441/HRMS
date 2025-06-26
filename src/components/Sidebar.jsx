import React, { useState } from 'react';
import { UserPlus, Users, ChartNoAxesColumnIncreasing, Sparkles, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoIcon from '../assets/images/logo.png';
import { Search } from 'lucide-react';
import '../styles/dashboard.css';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logoIcon || "/placeholder.svg"} alt="Logo" />
        <span>LOGO</span>
      </div>
      <div className="sidebar-search">
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search" />
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-category">Recruitment
          <Link
            to="/dashboard/candidates"
            className={`sidebar-item ${location.pathname === '/dashboard/candidates' ? 'active' : ''}`}
          >
            <UserPlus size={18} /> Candidates
          </Link>
        </div>
        <div className="sidebar-category">Organization
          <Link
            to="/dashboard/employees"
            className={`sidebar-item ${location.pathname === '/dashboard/employees' ? 'active' : ''}`}
          >
            <Users size={18} /> Employees
          </Link>
          <Link
            to="/dashboard/attendance"
            className={`sidebar-item ${location.pathname === '/dashboard/attendance' ? 'active' : ''}`}
          >
            <ChartNoAxesColumnIncreasing size={18} /> Attendance
          </Link>
          <Link
            to="/dashboard/leaves"
            className={`sidebar-item ${location.pathname === '/dashboard/leaves' ? 'active' : ''}`}
          >
            <Sparkles size={18} /> Leaves
          </Link>
        </div>
        <div className="sidebar-category">Others
          <button
            onClick={handleLogoutClick}
            className="sidebar-item"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-header-logout">Log Out</h2>
            <p>Are you sure you want to log out?</p>
            <div className="modal-buttons">
              <button onClick={handleCancelLogout} className="modal-cancel">Cancel</button>
              <button onClick={handleConfirmLogout} className="modal-logout">Logout</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;