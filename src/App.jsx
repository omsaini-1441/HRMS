import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './components/auth/Login';
import DashboardPage from './pages/DashboardPage';
import CandidatePage from './pages/CandidatePage';
import EmployeePage from './pages/EmployeePage';
import AttendancePage from './pages/AttendancePage';
import LeavesPage from './pages/LeavesPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route path="candidates" element={<CandidatePage />} />
            <Route path="employees" element={<EmployeePage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="leaves" element={<LeavesPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;