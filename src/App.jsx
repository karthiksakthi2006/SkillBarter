import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import PublicProfile from './pages/PublicProfile.jsx';
import Matches from './pages/Matches.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Study from './pages/Study.jsx';
import StudyRoom from './pages/StudyRoom.jsx';
import { useUser } from './context/UserContext.jsx';

export default function App() {
  const { user, loading } = useUser();

  if (loading) return <div className="app-loading">Loading SkillBarter...</div>;

  return (
    <>
      {user && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/sign-up" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" replace />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" replace />} />
          <Route path="/profile/:username" element={<PublicProfile />} />
          <Route path="/matches" element={user ? <Matches /> : <Navigate to="/" replace />} />
          <Route path="/study" element={user ? <Study /> : <Navigate to="/" replace />} />
          <Route path="/study/:roomId" element={user ? <StudyRoom /> : <Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
