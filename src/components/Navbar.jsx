import { NavLink, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_ITEMS = [
  { to: '/',          label: 'Home',       icon: HomeIcon },
  { to: '/explore',   label: 'Explore',    icon: ExploreIcon },
  { to: '/library',   label: 'Library',    icon: LibraryIcon },
  { to: '/playlists', label: 'Playlists',  icon: PlaylistIcon },
  { to: '/favorites', label: 'Favoris',    icon: HeartIcon },
  { to: '/stats',     label: 'Stats',      icon: StatsIcon },
  { to: '/radio',     label: 'Radio',      icon: RadioIcon },
  { to: '/reader',    label: 'Livres',     icon: BookIcon },
  { to: '/events',    label: 'Events',     icon: EventIcon },
];

export default function Navbar() {
  const { favorites, playlists } = usePlayer();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="navbar-desktop">
        <div className="navbar-logo">
          <span className="logo-icon">🎧</span>
          <span className="logo-text">Nili's Jam</span>
        </div>

        <div className="navbar-links">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon"><Icon /></span>
              <span className="nav-label">{label}</span>
              {to === '/favorites'  && favorites.length > 0  && <span className="nav-badge">{favorites.length}</span>}
              {to === '/playlists'  && playlists.length > 0  && <span className="nav-badge">{playlists.length}</span>}
            </NavLink>
          ))}
        </div>

        {user && (
          <div className="navbar-user" onClick={() => navigate('/profile')} style={{cursor:'pointer'}}>
            <img src={user.avatar} alt={user.username} className="navbar-avatar" />
            <div className="navbar-user-info">
              <p className="navbar-username">{user.username}</p>
              <p className="navbar-useremail">{user.email}</p>
            </div>
            <button className="navbar-logout-btn" onClick={e => { e.stopPropagation(); handleLogout(); }} title="Se déconnecter">
              <LogoutIcon />
            </button>
          </div>
        )}

        <div className="navbar-footer">
          <p className="navbar-version">Nili's Jam v4.0</p>
        </div>
      </nav>

      {/* Mobile bottom bar — show most important items */}
      <nav className="navbar-mobile">
        {[NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[2], NAV_ITEMS[3], NAV_ITEMS[4]].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon"><Icon /></span>
            <span className="mobile-nav-label">{label}</span>
          </NavLink>
        ))}
        <NavLink to="/profile" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <span className="mobile-nav-icon">
            {user ? <img src={user.avatar} alt="" style={{width:18,height:18,borderRadius:'50%',objectFit:'cover'}} /> : <ProfileIcon />}
          </span>
          <span className="mobile-nav-label">Profil</span>
        </NavLink>
      </nav>
    </>
  );
}

function HomeIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function ExploreIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function LibraryIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>; }
function HeartIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>; }
function EventIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function RadioIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><circle cx="12" cy="12" r="3"/><path d="M12 9V3M12 21v-6M9 12H3M21 12h-6"/></svg>; }
function BookIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>; }
function LogoutIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function StatsIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function PlaylistIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function ProfileIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
