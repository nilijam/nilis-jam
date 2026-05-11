// ============================================================
// NilsJam — Playlists personnalisées
// ============================================================
import { useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import TrackRow from '../components/TrackRow';
import './Playlists.css';

export default function Playlists() {
  const {
    playlists, createPlaylist, renamePlaylist, deletePlaylist,
    togglePlaylistPublic, removeTrackFromPlaylist, reorderPlaylistTrack,
    playTrack,
  } = usePlayer();

  const [activeId,   setActiveId]   = useState(null);
  const [creating,   setCreating]   = useState(false);
  const [newName,    setNewName]     = useState('');
  const [editingId,  setEditingId]   = useState(null);
  const [editName,   setEditName]    = useState('');
  const [dragIdx,    setDragIdx]     = useState(null);
  const inputRef = useRef(null);

  const activePlaylist = playlists.find(p => p.id === activeId);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const id = createPlaylist(name, false);
    setActiveId(id);
    setNewName('');
    setCreating(false);
  };

  const handleRename = (id) => {
    renamePlaylist(id, editName.trim() || 'Playlist');
    setEditingId(null);
  };

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver  = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    reorderPlaylistTrack(activeId, dragIdx, idx);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="page-container fade-in">
      <div className="pl-header">
        <h1 className="page-title">Playlists</h1>
        <button className="pl-create-btn" onClick={() => { setCreating(true); setTimeout(() => inputRef.current?.focus(), 50); }}>
          + Créer
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="pl-create-form">
          <input
            ref={inputRef}
            className="pl-name-input"
            placeholder="Nom de la playlist…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
            maxLength={40}
          />
          <button className="pl-confirm-btn" onClick={handleCreate}>✓ Créer</button>
          <button className="pl-cancel-btn" onClick={() => setCreating(false)}>✕</button>
        </div>
      )}

      <div className="pl-layout">
        {/* Sidebar list */}
        <aside className="pl-sidebar">
          {playlists.length === 0 && !creating && (
            <div className="pl-empty-hint">
              <span>🎵</span>
              <p>Aucune playlist</p>
              <p style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Clique sur "Créer" pour commencer</p>
            </div>
          )}
          {playlists.map(pl => (
            <div
              key={pl.id}
              className={`pl-sidebar-item ${pl.id === activeId ? 'active' : ''}`}
              onClick={() => setActiveId(pl.id)}
            >
              <div className="pl-sidebar-icon">
                {pl.tracks[0]?.cover
                  ? <img src={pl.tracks[0].cover} alt="" />
                  : <span>🎵</span>}
              </div>
              <div className="pl-sidebar-info">
                {editingId === pl.id ? (
                  <input
                    className="pl-rename-input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter') handleRename(pl.id); if(e.key==='Escape') setEditingId(null); }}
                    onBlur={() => handleRename(pl.id)}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <p className="pl-sidebar-name">{pl.name}</p>
                )}
                <p className="pl-sidebar-count">
                  {pl.tracks.length} titre{pl.tracks.length !== 1 ? 's' : ''}
                  {' · '}<span className={`pl-visibility ${pl.isPublic ? 'pub' : 'priv'}`}>{pl.isPublic ? '🌐 Public' : '🔒 Privé'}</span>
                </p>
              </div>
            </div>
          ))}
        </aside>

        {/* Detail */}
        <section className="pl-detail">
          {!activePlaylist ? (
            <div className="pl-detail-empty">
              <span style={{fontSize:'3rem'}}>🎶</span>
              <p>Sélectionne ou crée une playlist</p>
            </div>
          ) : (
            <>
              <div className="pl-detail-header">
                <div className="pl-detail-cover">
                  {activePlaylist.tracks[0]?.cover
                    ? <img src={activePlaylist.tracks[0].cover} alt="" />
                    : <span style={{fontSize:'2.5rem'}}>🎵</span>}
                </div>
                <div className="pl-detail-meta">
                  <p className="pl-detail-name">{activePlaylist.name}</p>
                  <p className="pl-detail-info">
                    {activePlaylist.tracks.length} titre{activePlaylist.tracks.length !== 1 ? 's' : ''}
                  </p>
                  <div className="pl-detail-actions">
                    {activePlaylist.tracks.length > 0 && (
                      <button className="btn-primary" onClick={() => playTrack(activePlaylist.tracks[0], activePlaylist.tracks)}>
                        ▶ Lire tout
                      </button>
                    )}
                    <button className="pl-action-btn" onClick={() => { setEditingId(activePlaylist.id); setEditName(activePlaylist.name); }} title="Renommer">✏️</button>
                    <button className="pl-action-btn" onClick={() => togglePlaylistPublic(activePlaylist.id)} title="Changer la visibilité">
                      {activePlaylist.isPublic ? '🌐' : '🔒'}
                    </button>
                    <button className="pl-action-btn pl-delete-btn" onClick={() => { deletePlaylist(activePlaylist.id); setActiveId(null); }} title="Supprimer">🗑️</button>
                  </div>
                </div>
              </div>

              {activePlaylist.tracks.length === 0 ? (
                <div className="pl-tracks-empty">
                  <span>🎵</span>
                  <p>Playlist vide</p>
                  <p style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>
                    Clique sur ⋯ sur n'importe quelle piste pour l'ajouter ici
                  </p>
                </div>
              ) : (
                <div className="pl-tracks-list">
                  <p className="pl-drag-hint">↕ Glisse pour réordonner</p>
                  {activePlaylist.tracks.map((track, i) => (
                    <div
                      key={`${track.id}-${i}`}
                      className={`pl-track-row-wrap ${dragIdx === i ? 'dragging' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={e => handleDragOver(e, i)}
                      onDragEnd={handleDragEnd}
                    >
                      <span className="pl-drag-handle">⠿</span>
                      <TrackRow track={track} tracks={activePlaylist.tracks} index={i} />
                      <button
                        className="pl-remove-track"
                        onClick={() => removeTrackFromPlaylist(activePlaylist.id, track.id)}
                        title="Retirer de la playlist"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
