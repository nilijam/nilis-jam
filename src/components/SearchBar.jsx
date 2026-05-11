import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchTracks, searchArtists } from '../services/api';
import './SearchBar.css';

function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

export default function SearchBar({ onSearch, placeholder = 'Search artists, songs...', autoFocus, withSuggestions }) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const ref = useRef(null);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  const fetchSuggestions = useCallback(async (q) => {
    if (!q.trim() || !withSuggestions) { setSuggestions([]); return; }
    try {
      const [tracks, artists] = await Promise.all([
        searchTracks(q),
        searchArtists(q),
      ]);
      const merged = [
        ...artists.slice(0, 3).map(a => ({ type: 'artist', id: a.id, title: a.name, sub: `${(a.nb_fan || 0).toLocaleString()} fans`, img: a.picture_medium || a.picture, data: a })),
        ...tracks.slice(0, 4).map(t => ({ type: 'track', id: t.id, title: t.title, sub: t.artist, img: t.cover, data: t })),
      ];
      setSuggestions(merged);
      setShowSug(merged.length > 0);
    } catch {}
  }, [withSuggestions]);

  const debouncedFetch = useDebounce(fetchSuggestions, 300);

  const handleChange = (e) => {
    const q = e.target.value;
    setValue(q);
    onSearch(q);
    debouncedFetch(q);
    if (!q) { setSuggestions([]); setShowSug(false); }
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
    setSuggestions([]);
    setShowSug(false);
    ref.current?.focus();
  };

  const handleSuggestionClick = (sug) => {
    setShowSug(false);
    setValue('');
    if (sug.type === 'artist') {
      navigate(`/explore?artist=${sug.id}&name=${encodeURIComponent(sug.title)}`);
    } else {
      // Play track or navigate
      navigate(`/explore?q=${encodeURIComponent(sug.title)}`);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSug(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="search-bar-wrap" ref={wrapRef} style={{ position: 'relative' }}>
      <div className="search-bar">
        <SearchIcon />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowSug(true)}
          placeholder={placeholder}
          className="search-input"
          autoFocus={autoFocus}
          aria-label="Search"
        />
        {value && (
          <button className="search-clear" onClick={handleClear} aria-label="Clear search">
            <CloseIcon />
          </button>
        )}
      </div>

      {showSug && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map(sug => (
            <div key={`${sug.type}-${sug.id}`} className="suggestion-item" onClick={() => handleSuggestionClick(sug)}>
              <img src={sug.img} alt={sug.title} className={`suggestion-img ${sug.type === 'artist' ? 'round' : ''}`} />
              <div className="suggestion-info">
                <p className="suggestion-title">{sug.title}</p>
                <p className="suggestion-sub">{sug.sub}</p>
              </div>
              <span className={`suggestion-type ${sug.type}`}>{sug.type === 'artist' ? 'Artiste' : 'Titre'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
