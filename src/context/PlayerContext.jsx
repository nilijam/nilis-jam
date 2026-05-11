import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const PlayerContext = createContext(null);

function loadLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; }
  catch { return fallback; }
}
function saveLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue,        setQueue]        = useState([]);
  const [queueIndex,   setQueueIndex]   = useState(0);
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [volume,       setVolume]       = useState(loadLS('nili_volume', 0.75));
  const [progress,     setProgress]     = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [shuffle,      setShuffle]      = useState(false);
  const [repeat,       setRepeat]       = useState('none');
  const [favorites,    setFavorites]    = useState(() => loadLS('nili_favorites', []));
  const [history,      setHistory]      = useState(() => loadLS('nili_history', []));
  const [listenStats,  setListenStats]  = useState(() =>
    loadLS('nili_listen_stats', { totalSeconds:0, weekSeconds:0, weekStart:null, artistCounts:{}, dayCounts:{} })
  );
  const [playlists, setPlaylists] = useState(() => loadLS('nili_playlists', []));

  const audioRef   = useRef(new Audio());
  const trackStart = useRef(null);
  const currentTrackRef = useRef(null);
  currentTrackRef.current = currentTrack;

  const flushListenTime = useCallback(() => {
    if (!trackStart.current || !currentTrackRef.current) return;
    const secs = Math.min((Date.now() - trackStart.current) / 1000, currentTrackRef.current.duration || 30);
    trackStart.current = null;
    if (secs < 3) return;
    const today = new Date().toISOString().slice(0, 10);
    const nowMs = Date.now();
    setListenStats(prev => {
      let weekSeconds = prev.weekSeconds || 0;
      let weekStart   = prev.weekStart;
      if (!weekStart || nowMs - weekStart > 7 * 86400000) { weekSeconds = 0; weekStart = nowMs; }
      const artistCounts = { ...prev.artistCounts };
      const artist = currentTrackRef.current?.artist || 'Unknown';
      artistCounts[artist] = (artistCounts[artist] || 0) + secs;
      const dayCounts = { ...prev.dayCounts };
      dayCounts[today] = (dayCounts[today] || 0) + secs;
      return { totalSeconds:(prev.totalSeconds||0)+secs, weekSeconds:weekSeconds+secs, weekStart, artistCounts, dayCounts };
    });
  }, []);

  const addToHistoryFn = useCallback((track) => {
    setHistory(prev => {
      const entry = { ...track, playedAt: new Date().toISOString() };
      return [entry, ...prev.filter(h => h.id !== track.id)].slice(0, 50);
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const onTimeUpdate  = () => setProgress(audio.currentTime);
    const onDurationEvt = () => setDuration(audio.duration || 0);
    const onPlay        = () => { setIsPlaying(true); if (!trackStart.current) trackStart.current = Date.now(); };
    const onPause       = () => { setIsPlaying(false); flushListenTime(); };
    const onEnded       = () => { flushListenTime(); };

    audio.addEventListener('timeupdate',     onTimeUpdate);
    audio.addEventListener('loadedmetadata', onDurationEvt);
    audio.addEventListener('play',           onPlay);
    audio.addEventListener('pause',          onPause);
    audio.addEventListener('ended',          onEnded);
    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onDurationEvt);
      audio.removeEventListener('play',           onPlay);
      audio.removeEventListener('pause',          onPause);
      audio.removeEventListener('ended',          onEnded);
    };
  }, [flushListenTime]);

  useEffect(() => { audioRef.current.volume = volume; saveLS('nili_volume', volume); }, [volume]);
  useEffect(() => { saveLS('nili_favorites',    favorites);   }, [favorites]);
  useEffect(() => { saveLS('nili_history',      history);     }, [history]);
  useEffect(() => { saveLS('nili_listen_stats', listenStats); }, [listenStats]);
  useEffect(() => { saveLS('nili_playlists',    playlists);   }, [playlists]);

  const repeatRef  = useRef(repeat);
  const queueRef   = useRef(queue);
  const queueIdxRef= useRef(queueIndex);
  repeatRef.current  = repeat;
  queueRef.current   = queue;
  queueIdxRef.current= queueIndex;

  const playTrackRaw = useCallback((track, newQueue, newIdx) => {
    const audio = audioRef.current;
    flushListenTime();
    audio.src = track.preview || track.url || '';
    audio.load();
    audio.play().catch(() => {});
    setCurrentTrack(track);
    setProgress(0); setDuration(0);
    trackStart.current = Date.now();
    addToHistoryFn(track);
    if (newQueue !== undefined) { setQueue(newQueue); setQueueIndex(newIdx ?? 0); }
  }, [flushListenTime, addToHistoryFn]);

  // handle ended via ref to avoid stale closure
  useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => {
      flushListenTime();
      const rep = repeatRef.current;
      const q   = queueRef.current;
      const idx = queueIdxRef.current;
      if (rep === 'one') { audio.currentTime = 0; audio.play().catch(() => {}); return; }
      let next = idx + 1;
      if (next >= q.length) { if (rep === 'all') next = 0; else return; }
      const track = q[next];
      if (!track) return;
      setQueueIndex(next);
      audio.src = track.preview || track.url || '';
      audio.load(); audio.play().catch(() => {});
      setCurrentTrack(track); setProgress(0); setDuration(0);
      trackStart.current = Date.now();
      setHistory(prev => [{ ...track, playedAt: new Date().toISOString() }, ...prev.filter(h => h.id !== track.id)].slice(0, 50));
    };
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [flushListenTime]);

  const playTrack = useCallback((track, tracks = []) => {
    const audio = audioRef.current;
    if (currentTrack?.id === track.id && audio.src) {
      isPlaying ? audio.pause() : audio.play().catch(() => {});
      return;
    }
    if (tracks.length) {
      const baseQueue = shuffle ? shuffleArr(tracks) : tracks;
      const idx = baseQueue.findIndex(t => t.id === track.id);
      playTrackRaw(track, baseQueue, idx === -1 ? 0 : idx);
    } else {
      playTrackRaw(track, undefined, undefined);
    }
  }, [currentTrack, isPlaying, shuffle, playTrackRaw]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!currentTrackRef.current) return;
    isPlaying ? audio.pause() : audio.play().catch(() => {});
  }, [isPlaying]);

  const playNext = useCallback(() => {
    const q   = queueRef.current;
    const idx = queueIdxRef.current;
    if (!q.length) return;
    let next = idx + 1;
    if (next >= q.length) { if (repeatRef.current === 'all') next = 0; else return; }
    setQueueIndex(next);
    playTrackRaw(q[next], undefined, undefined);
  }, [playTrackRaw]);

  const playPrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    const q   = queueRef.current;
    const idx = queueIdxRef.current;
    if (!q.length) return;
    const prev = (idx - 1 + q.length) % q.length;
    setQueueIndex(prev);
    playTrackRaw(q[prev], undefined, undefined);
  }, [playTrackRaw]);

  const seek = useCallback((time) => { audioRef.current.currentTime = time; setProgress(time); }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => {
      const next = !prev;
      if (next && queueRef.current.length) {
        const shuffled = shuffleArr(queueRef.current);
        setQueue(shuffled);
        setQueueIndex(shuffled.findIndex(t => t.id === currentTrackRef.current?.id));
      }
      return next;
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none');
  }, []);

  const toggleFavorite = useCallback((track) => {
    setFavorites(prev => prev.some(f => f.id === track.id) ? prev.filter(f => f.id !== track.id) : [...prev, track]);
  }, []);
  const isFavorite = useCallback((id) => favorites.some(f => f.id === id), [favorites]);

  // playlists
  const createPlaylist = useCallback((name, isPublic = false) => {
    const pl = { id:`pl_${Date.now()}`, name, isPublic, tracks:[], createdAt:new Date().toISOString() };
    setPlaylists(prev => [...prev, pl]);
    return pl.id;
  }, []);
  const renamePlaylist = useCallback((id, name) => setPlaylists(prev => prev.map(p => p.id===id?{...p,name}:p)), []);
  const deletePlaylist = useCallback((id) => setPlaylists(prev => prev.filter(p => p.id!==id)), []);
  const togglePlaylistPublic = useCallback((id) => setPlaylists(prev => prev.map(p => p.id===id?{...p,isPublic:!p.isPublic}:p)), []);
  const addTrackToPlaylist = useCallback((playlistId, track) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id !== playlistId) return p;
      if (p.tracks.some(t => t.id === track.id)) return p;
      return { ...p, tracks:[...p.tracks, track] };
    }));
  }, []);
  const removeTrackFromPlaylist = useCallback((playlistId, trackId) => {
    setPlaylists(prev => prev.map(p => p.id===playlistId?{...p, tracks:p.tracks.filter(t=>t.id!==trackId)}:p));
  }, []);
  const reorderPlaylistTrack = useCallback((playlistId, fromIdx, toIdx) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id !== playlistId) return p;
      const tracks = [...p.tracks];
      const [moved] = tracks.splice(fromIdx, 1);
      tracks.splice(toIdx, 0, moved);
      return { ...p, tracks };
    }));
  }, []);

  const addToQueue = useCallback((track) => {
    setQueue(prev => prev.some(t=>t.id===track.id) ? prev : [...prev, track]);
  }, []);
  const removeFromQueue = useCallback((trackId) => {
    setQueue(prev => {
      const idx = prev.findIndex(t => t.id === trackId);
      if (idx === -1) return prev;
      if (idx <= queueIdxRef.current) setQueueIndex(i => Math.max(0, i-1));
      return prev.filter(t => t.id !== trackId);
    });
  }, []);
  const clearHistory = useCallback(() => { setHistory([]); saveLS('nili_history', []); }, []);
  const resetStats   = useCallback(() => {
    const fresh = {totalSeconds:0,weekSeconds:0,weekStart:null,artistCounts:{},dayCounts:{}};
    setListenStats(fresh); saveLS('nili_listen_stats', fresh);
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentTrack, isPlaying, volume, progress, duration, shuffle, repeat,
      queue, queueIndex,
      playTrack, togglePlay, playNext, playPrev, seek,
      setVolume, toggleShuffle, cycleRepeat,
      addToQueue, removeFromQueue,
      favorites, toggleFavorite, isFavorite,
      history, listenStats, clearHistory, resetStats,
      playlists, createPlaylist, renamePlaylist, deletePlaylist,
      togglePlaylistPublic, addTrackToPlaylist, removeTrackFromPlaylist, reorderPlaylistTrack,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
