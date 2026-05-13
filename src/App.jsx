import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Player from './components/Player';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Library from './pages/Library';
import Favorites from './pages/Favorites';
import Events from './pages/Events';
import Radio from './pages/Radio';
import EpubReader from './pages/EpubReader';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Playlists from './pages/Playlists';
import Stats from './pages/Stats';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify"   element={<Verify />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <div className="app-layout">
                    <Navbar />
                    <main className="main-content">
                      <Routes>
                        <Route path="/"          element={<Home />} />
                        <Route path="/explore"   element={<Explore />} />
                        <Route path="/library"   element={<Library />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/playlists" element={<Playlists />} />
                        <Route path="/stats"     element={<Stats />} />
                        <Route path="/profile"   element={<Profile />} />
                        <Route path="/events"    element={<Events />} />
                        <Route path="/radio"     element={<Radio />} />
                        <Route path="/reader"    element={<EpubReader />} />
                      </Routes>
                    </main>
                  </div>
                  <Player />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </PlayerProvider>
    </AuthProvider>
  );
}
