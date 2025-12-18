import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/WelcomeForm/WelcomeForm';
import Login from './pages/LoginForm/LoginForm';
import Register from './pages/RegisterForm/RegisterForm';
import Dashboard from './pages/DashboardForm/DashboardForm';
import Profile from './pages/ProfileForm/ProfileForm';
import Help from './pages/HelpForm/HelpForm';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/help" element={<Help />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;