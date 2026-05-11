// ============================================================
// NilsJam — Profil utilisateur
// ============================================================
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import TrackRow from '../components/TrackRow';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { favorites, playlists, listenStats, history } = usePlayer();

  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`nili_bio_${user?.id}`) || '""') || ''; } catch { return ''; }
  });
  const [bioInput, setBioInput] = useState(bio);
  const [activeTab, setActiveTab] = useState('favorites');

  const saveBio = () => {
    const v = bioInput.trim();
    setBio(v);
    localStorage.setItem(`nili_bio_${user?.id}`, JSON.stringify(v));
    setEditingBio(false);
  };

  const totalH = Math.round((listenStats.totalSeconds || 0) / 3600);
  const publicPlaylists = playlists.filter(p => p.isPublic);

  return (
    <div className="page-container fade-in">
      {/* Hero */}
      <div className="profile-hero">
        <img src={user?.avatar} alt={user?.username} className="profile-avatar" />
        <div className="profile-info">
          <h1 className="profile-username">{user?.username}</h1>
          <p className="profile-email">{user?.email}</p>
          {editingBio ? (
            <div className="profile-bio-edit">
              <textarea
                className="profile-bio-input"
                value={bioInput}
                onChange={e => setBioInput(e.target.value)}
                placeholder="Parle de toi, de ta musique…"
                rows={3} maxLength={200} autoFocus
              />
              <div style={{display:'flex',gap:'0.5rem'}}>
                <button className="btn-primary" style={{fontSize:'0.8rem',padding:'0.4rem 0.9rem'}} onClick={saveBio}>Sauvegarder</button>
                <button className="profile-cancel-btn" onClick={() => setEditingBio(false)}>Annuler</button>
              </div>
            </div>
          ) : (
            <div className="profile-bio-wrap">
              <p className="profile-bio">{bio || 'Aucune bio encore…'}</p>
              <button className="profile-edit-btn" onClick={() => { setBioInput(bio); setEditingBio(true); }}>✏️ Modifier</button>
            </div>
          )}
        </div>
        <div className="profile-stats-mini">
          <div className="profile-stat">
            <span className="profile-stat-val">{favorites.length}</span>
            <span className="profile-stat-lbl">Favoris</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-val">{playlists.length}</span>
            <span className="profile-stat-lbl">Playlists</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-val">{totalH}h</span>
            <span className="profile-stat-lbl">Écoutées</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-val">{history.length}</span>
            <span className="profile-stat-lbl">Titres joués</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {[['favorites','❤️ Favoris'],['playlists','🎵 Playlists publiques'],['recent','🕐 Récent']].map(([id,lbl]) => (
          <button key={id} className={`profile-tab ${activeTab===id?'active':''}`} onClick={() => setActiveTab(id)}>{lbl}</button>
        ))}
      </div>

      {/* Favoris */}
      {activeTab === 'favorites' && (
        <div className="profile-section">
          {favorites.length === 0
            ? <p className="profile-empty">Aucun favori</p>
            : <div className="grid-tracks">{favorites.map((t,i) => <TrackRow key={t.id} track={t} tracks={favorites} index={i} />)}</div>
          }
        </div>
      )}

      {/* Playlists publiques */}
      {activeTab === 'playlists' && (
        <div className="profile-section">
          {publicPlaylists.length === 0
            ? <p className="profile-empty">Aucune playlist publique</p>
            : <div className="profile-pl-grid">
                {publicPlaylists.map(pl => (
                  <div key={pl.id} className="profile-pl-card">
                    <div className="profile-pl-cover">
                      {pl.tracks[0]?.cover ? <img src={pl.tracks[0].cover} alt="" /> : <span>🎵</span>}
                    </div>
                    <p className="profile-pl-name">{pl.name}</p>
                    <p className="profile-pl-count">{pl.tracks.length} titres · 🌐 Public</p>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Récent */}
      {activeTab === 'recent' && (
        <div className="profile-section">
          {history.length === 0
            ? <p className="profile-empty">Aucun historique</p>
            : <div className="grid-tracks">{history.slice(0,20).map((t,i) => <TrackRow key={`${t.id}-${i}`} track={t} tracks={history} index={i} />)}</div>
          }
        </div>
      )}
    </div>
  );
}
