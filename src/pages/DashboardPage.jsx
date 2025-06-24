import { Outlet } from 'react-router-dom';

function DashboardPage() {
  return (
    <div>
      <h2>HRMS Dashboard</h2>
      <Outlet />
    </div>
  );
}

export default DashboardPage;