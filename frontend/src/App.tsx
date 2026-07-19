import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomeDashboard } from './pages/HomeDashboard';
import { Portal } from './pages/Portal';
import './App.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/admin" element={<Navigate to="/portal" replace />} />
        <Route path="/dashboard" element={<Navigate to="/portal" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
