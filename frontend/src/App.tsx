import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomeDashboard } from './pages/HomeDashboard';
import { AdminPanel } from './pages/AdminPanel';
import { ClientDashboard } from './pages/ClientDashboard';
import './App.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/dashboard" element={<ClientDashboard />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
