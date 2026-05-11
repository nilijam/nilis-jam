import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchTracks, searchArtists, getArtistTracks, getChart } from '../services/api';
import SearchBar from '../components/SearchBar';
import MusicCard from '../components/MusicCard';
import TrackRow from '../components/TrackRow';
import Loader from '../components/Loader';
import './Explore.css';

function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

export default function Explore() {
  const [searchParams] = useSearchParams();
  const [query,    setQuery]    = useState('');
  const [tracks,   setTracks]   = useState([]);
  const [artists,  setArtists]  = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    const artistId = searchParams.get('artist');
    const name     = searchParams.get('name');
    const q        = searchParams.get('q');
    if (artistId) {
      setLoading(true);
      setQuery(name || '');
      getArtistTracks(artistId).then(t => setTracks(t)).catch(() => {}).finally(() => setLoading(false));
    } else if (q) {
      setQuery(q);
      doSearch(q);
    } else {
      getChart().then(t => setFeatured(t)).catch(() => {});
    }
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setTracks([]); setArtists([]); return; }
    setLoading(true);
    try {
      const [t, a] = await Promise.all([searchTracks(q), searchArtists(q)]);
      setTracks(t); setArtists(a);
    } catch {}
    setLoading(false);
  }, []);

  const debounced = useDebounce(doSearch, 400);
  const handleSearch = (q) => { setQuery(q); debounced(q); };
  const hasResults = tracks.length > 0 || artists.length > 0;

  return (
    <div className="page-container fade-in">
      <h1 className="page-title">Explore</h1>
      <div className="explore-search">
        <SearchBar onSearch={handleSearch} placeholder="Rechercher artistes, titres, albums..." autoFocus withSuggestions />
      </div>

      {loading && <Loader message="Recherche en cours..." />}

      {!loading && !hasResults && !query && featured.length > 0 && (
        <section>
          <p className="section-label">Populaires en ce moment</p>
          <div className="grid-cards">
            {featured.slice(0, 12).map(track => <MusicCard key={track.id} track={track} tracks={featured} />)}
          </div>
        </section>
      )}

      {!loading && hasResults && (
        <>
          {artists.length > 0 && (
            <section className="explore-section">
              <p className="section-label">Artistes</p>
              <div className="artists-grid">
                {artists.map(a => (
                  <div key={a.id} className="explore-artist">
                    <img src={a.picture_medium || a.picture} alt={a.name} className="explore-artist-img" />
                    <span className="explore-artist-name">{a.name}</span>
                    <span className="explore-artist-fans">{a.nb_fan?.toLocaleString()} fans</span>
                  </div>
                ))}
              </div>
            </section>
          )}
          {tracks.length > 0 && (
            <section className="explore-section">
              <p className="section-label">Titres — {tracks.length} résultats</p>
              <div className="grid-tracks">
                {tracks.map((track, i) => <TrackRow key={track.id} track={track} tracks={tracks} index={i} />)}
              </div>
            </section>
          )}
        </>
      )}

      {!loading && query && !hasResults && (
        <div className="empty-state">
          <span style={{ fontSize: '2.5rem' }}>🔍</span>
          <p>Aucun résultat pour « {query} »</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Essaie un autre terme de recherche</p>
        </div>
      )}
    </div>
  );
}
