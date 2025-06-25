import React from 'react';
import { UserPlus, Users, ChartNoAxesColumnIncreasing, Sparkles, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoIcon from '../assets/images/logo.png';
import { Search } from 'lucide-react';
import '../styles/dashboard.css';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/');
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
            onClick={handleLogout}
            className="sidebar-item"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;