import { Routes, Route, Navigate } from 'react-router-dom';
import Planner from './pages/Planner';
import Accounts from './pages/Accounts';
import Tracker from './pages/Tracker';
import Imports from './pages/Imports';
import Settings from './pages/Settings';
import { AppShell } from './layout/AppShell';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/planner" replace />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/imports" element={<Imports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
