import { usePlayer } from '../context/PlayerContext';
import './MusicCard.css';

export default function MusicCard({ track, tracks = [] }) {
  const { currentTrack, isPlaying, playTrack, toggleFavorite, isFavorite } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  const fav = isFavorite(track.id);

  const handlePlay = (e) => {
    e.stopPropagation();
    playTrack(track, tracks.length ? tracks : [track]);
  };

  const handleFav = (e) => {
    e.stopPropagation();
    toggleFavorite(track);
  };

  const cover = track.cover || `https://ui-avatars.com/api/?name=${encodeURIComponent(track.title)}&background=8b5cf6&color=fff&size=200`;

  return (
    <div className={`music-card ${isActive ? 'active' : ''}`} onClick={handlePlay}>
      <div className="card-cover-wrap">
        <img src={cover} alt={track.title} className="card-cover" loading="lazy" />
        <div className="card-overlay">
          <button className="card-play-btn" onClick={handlePlay} aria-label="Play">
            {isActive && isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
        {isActive && (
          <div className="card-playing-bar">
            <span/><span/><span/>
          </div>
        )}
        {track.isLocal && <span className="card-local-badge">Local</span>}
      </div>
      <div className="card-info">
        <p className="card-title" title={track.title}>{track.title}</p>
        <p className="card-artist" title={track.artist}>{track.artist}</p>
      </div>
      <button className={`card-fav-btn ${fav ? 'active' : ''}`} onClick={handleFav} aria-label={fav ? 'Remove favorite' : 'Add favorite'}>
        <HeartIcon filled={fav} />
      </button>
    </div>
  );
}

function PlayIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}
function PauseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
}
function HeartIcon({ filled }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
}
