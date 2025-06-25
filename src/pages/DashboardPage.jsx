import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      
      try {
      
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        if (payload.exp < currentTime) {
          localStorage.removeItem('token');
          navigate('/');
          return;
        }
      } catch (error) {
        // Invalid token format
        localStorage.removeItem('token');
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard/candidates':
        return 'Candidates';
      case '/dashboard/employees':
        return 'Employees';
      case '/dashboard/attendance':
        return 'Attendance';
      case '/dashboard/leaves':
        return 'Leaves';
      default:
        return 'HRMS Dashboard';
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title={getPageTitle()} />
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardPage;