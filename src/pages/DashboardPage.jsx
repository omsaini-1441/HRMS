import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Setup axios interceptor for 401 handling
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
        return Promise.reject(error);
      }
    );

    // Check token validity on mount
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
        }
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/');
      }
    };

    checkAuth();

    // Cleanup interceptor on unmount
    return () => axios.interceptors.response.eject(interceptor);
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