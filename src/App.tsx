import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/DashboardForm/DashboardForm';
import ProfileForm from './pages/ProfileForm/ProfileForm';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<ProfileForm />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;