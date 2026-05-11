import { usePlayer } from '../context/PlayerContext';
import TrackRow from '../components/TrackRow';
import MusicCard from '../components/MusicCard';
import './Favorites.css';

export default function Favorites() {
  const { favorites, playTrack } = usePlayer();

  const playAll = () => {
    if (favorites.length) playTrack(favorites[0], favorites);
  };

  return (
    <div className="page-container fade-in">
      <div className="fav-header">
        <div className="fav-hero">
          <div className="fav-hero-icon">❤️</div>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Favorites</h1>
            <p className="fav-count">{favorites.length} track{favorites.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>
        {favorites.length > 0 && (
          <button className="btn-primary" onClick={playAll}>
            <PlayIcon /> Play All
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <span style={{ fontSize: '3rem' }}>💔</span>
          <p>No favorites yet</p>
          <p style={{ fontSize: '0.8rem' }}>Tap ❤️ on any track to save it here</p>
        </div>
      ) : (
        <>
          <section style={{ marginBottom: '2rem' }}>
            <p className="section-label">All favorites</p>
            <div className="grid-tracks">
              {favorites.map((track, i) => (
                <TrackRow key={track.id} track={track} tracks={favorites} index={i} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function PlayIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>; }
