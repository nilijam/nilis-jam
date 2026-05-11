import { useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import './Player.css';

function fmt(s) {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
}

export default function Player() {
  const {
    currentTrack, isPlaying, volume, progress, duration,
    shuffle, repeat, queue, queueIndex,
    togglePlay, playNext, playPrev, seek, setVolume,
    toggleShuffle, cycleRepeat, toggleFavorite, isFavorite,
    addToQueue,
  } = usePlayer();
  const progressRef = useRef(null);
  const [showQueue, setShowQueue] = useState(false);

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * (duration || 30));
  };

  const pct   = duration ? (progress / duration) * 100 : 0;
  const cover = currentTrack?.cover || null;
  const fav   = currentTrack ? isFavorite(currentTrack.id) : false;

  const repeatLabel = repeat === 'one' ? '1' : repeat === 'all' ? '∞' : '';

  return (
    <>
      <div className={`player ${currentTrack ? 'visible' : ''}`}>
        {/* Track info */}
        <div className="player-track">
          {cover
            ? <img src={cover} alt={currentTrack?.title} className="player-cover" />
            : <div className="player-cover-placeholder">🎵</div>}
          <div className="player-track-info">
            <p className="player-track-title">{currentTrack?.title || 'Rien en cours'}</p>
            <p className="player-track-artist">{currentTrack?.artist || '—'}</p>
          </div>
          {currentTrack && (
            <button
              className={`player-fav-btn ${fav ? 'on' : ''}`}
              onClick={() => toggleFavorite(currentTrack)}
              title={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <HeartIcon filled={fav} />
            </button>
          )}
        </div>

        {/* Center controls */}
        <div className="player-center">
          <div className="player-controls">
            <button
              className={`player-btn player-shuffle ${shuffle ? 'active' : ''}`}
              onClick={toggleShuffle} title="Shuffle"
            ><ShuffleIcon /></button>

            <button onClick={playPrev} className="player-btn" aria-label="Précédent"><PrevIcon /></button>
            <button onClick={togglePlay} className="player-play" aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button onClick={playNext} className="player-btn" aria-label="Suivant"><NextIcon /></button>

            <button
              className={`player-btn player-repeat ${repeat !== 'none' ? 'active' : ''}`}
              onClick={cycleRepeat}
              title={`Répéter: ${repeat}`}
            >
              <RepeatIcon />{repeatLabel && <span className="repeat-label">{repeatLabel}</span>}
            </button>
          </div>
          <div className="player-progress">
            <span className="player-time">{fmt(progress)}</span>
            <div className="progress-bar" ref={progressRef} onClick={handleProgressClick} role="slider">
              <div className="progress-fill" style={{ width:`${pct}%` }}>
                <div className="progress-thumb" />
              </div>
            </div>
            <span className="player-time">{fmt(duration || currentTrack?.duration || 0)}</span>
          </div>
        </div>

        {/* Right: volume + queue */}
        <div className="player-right">
          <button
            className={`player-btn player-queue-btn ${showQueue ? 'active' : ''}`}
            onClick={() => setShowQueue(q => !q)}
            title="File d'attente"
          ><QueueIcon /></button>
          <div className="player-volume">
            <VolumeIcon />
            <input
              type="range" min="0" max="1" step="0.02"
              value={volume} onChange={e => setVolume(parseFloat(e.target.value))}
              className="volume-slider" aria-label="Volume"
            />
          </div>
        </div>
      </div>

      {/* Queue panel */}
      {showQueue && (
        <div className="queue-panel">
          <div className="queue-panel-header">
            <p className="queue-panel-title">File d'attente</p>
            <button className="queue-panel-close" onClick={() => setShowQueue(false)}>✕</button>
          </div>
          <div className="queue-list">
            {queue.length === 0 && <p className="queue-empty">File vide</p>}
            {queue.map((t, i) => (
              <div key={`${t.id}-${i}`} className={`queue-item ${i === queueIndex ? 'current' : ''}`}>
                <span className="queue-num">{i + 1}</span>
                <img
                  src={t.cover || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.title)}&background=1a1a2e&color=b06aff&size=40`}
                  alt={t.title} className="queue-cover"
                />
                <div className="queue-info">
                  <p className="queue-title">{t.title}</p>
                  <p className="queue-artist">{t.artist}</p>
                </div>
                {i === queueIndex && <span className="queue-now">▶</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function PlayIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>; }
function PauseIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>; }
function PrevIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function NextIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>; }
function VolumeIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>; }
function ShuffleIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>; }
function RepeatIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>; }
function QueueIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function HeartIcon({ filled }) { return <svg width="14" height="14" viewBox="0 0 24 24" fill={filled?'currentColor':'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>; }
