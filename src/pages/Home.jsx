import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChart, getChartArtists, getArtistTracks } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import MusicCard from '../components/MusicCard';
import TrackRow from '../components/TrackRow';
import MusicLoader from '../components/MusicLoader';
import './Home.css';

// Featured artists: Brandy, Aaliyah, Tyla + Gabonais
const FEATURED_ARTISTS = [
  {
    id: 'brandy',
    deezerQuery: 'Brandy',
    name: 'Brandy',
    tag: 'R&B Soul',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Brandy_Norwood_2019.jpg/400px-Brandy_Norwood_2019.jpg',
    gabon: false,
  },
  {
    id: 'aaliyah',
    deezerQuery: 'Aaliyah',
    name: 'Aaliyah',
    tag: 'R&B Legend',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Aaliyah_in_2001.jpg/400px-Aaliyah_in_2001.jpg',
    gabon: false,
  },
  {
    id: 'tyla',
    deezerQuery: 'Tyla',
    name: 'Tyla',
    tag: 'Afropop',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Tyla_cropped_from_Grammy_performance_%282024%29.jpg/400px-Tyla_cropped_from_Grammy_performance_%282024%29.jpg',
    gabon: false,
  },
  {
    id: 'patience-dabany',
    deezerQuery: 'Patience Dabany',
    name: 'Patience Dabany',
    tag: 'Gabon',
    img: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Patience_Dabany.jpg',
    gabon: true,
  },
  {
    id: 'oliver-ngoma',
    deezerQuery: 'Oliver Ngoma',
    name: 'Oliver Ngoma',
    tag: 'Gabon',
    img: 'https://media.telestar.fr/var/telestar/storage/images/media/images/personnalites/o/oliver-ngoma/735698-1-fre-FR/Oliver-Ngoma.jpg',
    gabon: true,
  },
  {
    id: 'nguema',
    deezerQuery: 'Nguema Gabon',
    name: 'Mbenga Youlou',
    tag: 'Gabon',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Flag_of_Gabon.svg/400px-Flag_of_Gabon.svg.png',
    gabon: true,
  },
];

const DEEZER_ARTIST_IDS = {
  'Brandy': 1218,
  'Aaliyah': 6731,
  'Tyla': 215754602,
  'Patience Dabany': null,
  'Oliver Ngoma': null,
};

export default function Home() {
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack } = usePlayer();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([getChart(), getChartArtists()])
      .then(([t, a]) => { setTracks(t); setArtists(a); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour 👋';
    if (h < 17) return 'Bon après-midi 🎵';
    return 'Bonsoir 🌙';
  };

  const handleFeaturedArtistClick = (artist) => {
    navigate(`/explore?q=${encodeURIComponent(artist.deezerQuery)}`);
  };

  return (
    <div className="page-container fade-in">
      {/* Hero */}
      <div className="home-hero">
        <h1 className="home-greeting">{greeting()}</h1>
        <p className="home-sub">Qu'est-ce que tu veux écouter aujourd'hui ?</p>
      </div>

      {loading ? (
        <MusicLoader text="Chargement des charts…" size="lg" />
      ) : (
        <>
          {/* Top Artists from Deezer */}
          {artists.length > 0 && (
            <section className="home-section">
              <p className="section-label">Top Artistes</p>
              <div className="artists-scroll">
                {artists.slice(0, 10).map(artist => (
                  <div
                    key={artist.id}
                    className="artist-chip"
                    onClick={() => navigate(`/explore?artist=${artist.id}&name=${encodeURIComponent(artist.name)}`)}
                  >
                    <img src={artist.picture_medium || artist.picture} alt={artist.name} className="artist-chip-img" />
                    <span className="artist-chip-name">{artist.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Featured Artists — Brandy, Aaliyah, Tyla, Gabonais */}
          <section className="home-section featured-artists-section">
            <p className="section-label">Artistes à la Une</p>
            <div className="featured-artists-grid">
              {FEATURED_ARTISTS.map(artist => (
                <div
                  key={artist.id}
                  className="featured-artist-card"
                  onClick={() => handleFeaturedArtistClick(artist)}
                >
                  <img
                    src={artist.img}
                    alt={artist.name}
                    loading="lazy"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=111120&color=b06aff&size=400&bold=true`; }}
                  />
                  <div className="featured-artist-card-overlay">
                    <p className="featured-artist-card-name">{artist.name}</p>
                    <p className="featured-artist-card-tag">{artist.tag}</p>
                  </div>
                  {artist.gabon && <span className="gabon-badge">🇬🇦 Gabon</span>}
                  <div className="featured-artist-card-play">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Tracks Grid */}
          {tracks.length > 0 && (
            <section className="home-section">
              <p className="section-label">Tendances du Moment</p>
              <div className="grid-cards">
                {tracks.slice(0, 8).map(track => (
                  <MusicCard key={track.id} track={track} tracks={tracks} />
                ))}
              </div>
            </section>
          )}

          {/* Top Tracks List */}
          {tracks.length > 0 && (
            <section className="home-section">
              <p className="section-label">Top Charts</p>
              <div className="home-tracks-header">
                <span>#</span><span></span>
                <span>Titre</span>
                <span className="col-album">Album</span>
                <span></span>
                <span>Durée</span>
              </div>
              <div className="grid-tracks">
                {tracks.slice(0, 12).map((track, i) => (
                  <TrackRow key={track.id} track={track} tracks={tracks} index={i} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
