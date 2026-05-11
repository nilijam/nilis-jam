import { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import './TrackRow.css';

function fmt(s) {
  if (!s) return '0:30';
  return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
}

export default function TrackRow({ track, tracks = [], index }) {
  const { currentTrack, isPlaying, playTrack, toggleFavorite, isFavorite, addToQueue, playlists, addTrackToPlaylist } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  const fav = isFavorite(track.id);
  const cover = track.cover || `https://ui-avatars.com/api/?name=${encodeURIComponent(track.title)}&background=8b5cf6&color=fff&size=80`;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <div className={`track-row ${isActive ? 'active' : ''}`} onClick={() => playTrack(track, tracks.length ? tracks : [track])}>
      <div className="track-num">
        {isActive && isPlaying
          ? <span className="track-bars"><span/><span/><span/></span>
          : <span className="track-index">{index != null ? index + 1 : '—'}</span>}
      </div>
      <img src={cover} alt={track.title} className="track-cover" loading="lazy" />
      <div className="track-meta">
        <p className="track-title">{track.title}</p>
        <p className="track-artist">{track.artist}</p>
      </div>
      <p className="track-album">{track.album}</p>
      <button className={`track-fav ${fav ? 'on' : ''}`} onClick={e => { e.stopPropagation(); toggleFavorite(track); }} aria-label="Toggle favorite">
        <HeartIcon filled={fav} />
      </button>
      <span className="track-duration">{fmt(track.duration)}</span>

      {/* Context menu trigger */}
      <div className="track-menu-wrap" ref={menuRef}>
        <button className="track-menu-btn" onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); }} title="Plus d'options">
          <DotsIcon />
        </button>
        {menuOpen && (
          <div className="track-menu-dropdown">
            <button className="track-menu-item" onClick={e => { e.stopPropagation(); addToQueue(track); setMenuOpen(false); }}>
              ➕ Ajouter à la file
            </button>
            {playlists.length > 0 && (
              <>
                <div className="track-menu-sep" />
                <p className="track-menu-label">Ajouter à une playlist</p>
                {playlists.map(pl => (
                  <button
                    key={pl.id}
                    className="track-menu-item"
                    onClick={e => { e.stopPropagation(); addTrackToPlaylist(pl.id, track); setMenuOpen(false); }}
                  >
                    🎵 {pl.name}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HeartIcon({ filled }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill={filled?'currentColor':'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
}
function DotsIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
}
