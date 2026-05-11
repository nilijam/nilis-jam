// ============================================================
// NilsJam — Ma Bibliothèque
// Onglets : Import MP3/WAV | Import par lien URL
// ============================================================

import { useState, useRef, useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';
import TrackRow from '../components/TrackRow';
import './Library.css';

let localIdCounter = 1;

function readAudioMeta(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => resolve({ duration: audio.duration, url }));
    audio.addEventListener('error', () => resolve({ duration: 0, url }));
  });
}

function guessTitle(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.split('/').pop() || '';
    const name = decodeURIComponent(path).replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    return name || u.hostname;
  } catch { return url.slice(0, 40); }
}

export default function Library() {
  const [activeTab,   setActiveTab]   = useState('files');
  const [localTracks, setLocalTracks] = useState([]);
  const [dragging,    setDragging]    = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [urlInput,    setUrlInput]    = useState('');
  const [urlTitle,    setUrlTitle]    = useState('');
  const [urlArtist,   setUrlArtist]   = useState('');
  const [urlLoading,  setUrlLoading]  = useState(false);
  const [urlError,    setUrlError]    = useState('');

  const fileInputRef = useRef(null);
  const { playTrack } = usePlayer();

  const processFiles = useCallback(async (files) => {
    const mp3s = Array.from(files).filter(
      f => f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|aac)$/i.test(f.name)
    );
    if (!mp3s.length) return;
    setUploading(true);
    const newTracks = await Promise.all(mp3s.map(async (file) => {
      const name = file.name.replace(/\.[^.]+$/, '');
      const parts = name.split(' - ');
      const meta = await readAudioMeta(file);
      return {
        id: `local_${localIdCounter++}`,
        title: parts[1] || name,
        artist: parts[0] || 'Artiste inconnu',
        album: 'Bibliothèque locale',
        cover: '', duration: meta.duration,
        url: meta.url, preview: meta.url, isLocal: true,
      };
    }));
    setLocalTracks(prev => [...newTracks, ...prev]);
    setUploading(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault(); setDragging(false);
    await processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileInput = useCallback(async (e) => {
    await processFiles(e.target.files); e.target.value = '';
  }, [processFiles]);

  const removeTrack = (id) => setLocalTracks(prev => prev.filter(t => t.id !== id));

  const handleUrlImport = async () => {
    const url = urlInput.trim();
    if (!url) { setUrlError('Entre une URL valide.'); return; }
    setUrlError(''); setUrlLoading(true);
    try {
      const testAudio = new Audio();
      await new Promise((resolve) => {
        testAudio.src = url;
        testAudio.onloadedmetadata = resolve;
        testAudio.onerror = resolve;
        setTimeout(resolve, 3000);
      });
      const track = {
        id: `url_${localIdCounter++}`,
        title: urlTitle.trim() || guessTitle(url),
        artist: urlArtist.trim() || 'Via lien',
        album: 'Import URL', cover: '',
        duration: testAudio.duration || 0,
        url, preview: url, isLocal: true,
      };
      setLocalTracks(prev => [track, ...prev]);
      setUrlInput(''); setUrlTitle(''); setUrlArtist('');
      playTrack(track, [track]);
    } catch {
      setUrlError("Impossible de charger cette URL audio.");
    } finally { setUrlLoading(false); }
  };

  return (
    <div className="page-container fade-in">
      <div className="library-header">
        <h1 className="page-title">Ma Bibliothèque</h1>
        <div className="library-tabs">
          <button className={`lib-tab ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>🎵 Fichiers</button>
          <button className={`lib-tab ${activeTab === 'url' ? 'active' : ''}`} onClick={() => setActiveTab('url')}>🔗 Par lien</button>
        </div>
      </div>

      {activeTab === 'files' && (
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="audio/*,.mp3,.wav,.ogg,.flac" multiple onChange={handleFileInput} hidden />
          {uploading ? (
            <><div className="spinner" /><p>Traitement des fichiers…</p></>
          ) : (
            <><div className="drop-icon">🎵</div>
            <p className="drop-title">{dragging ? 'Dépose ici !' : 'Importe ta musique'}</p>
            <p className="drop-hint">Glisse-dépose MP3, WAV, OGG, FLAC ou clique</p></>
          )}
        </div>
      )}

      {activeTab === 'url' && (
        <div className="url-import-box">
          <div className="url-import-icon">🔗</div>
          <h3 className="url-import-title">Importer un lien audio</h3>
          <p className="url-import-desc">Colle une URL vers un fichier MP3, WAV ou flux audio. Le titre est extrait automatiquement.</p>
          <div className="url-field-group">
            <label>URL du fichier audio *</label>
            <input className="url-input" type="url" placeholder="https://example.com/chanson.mp3"
              value={urlInput} onChange={e => { setUrlInput(e.target.value); setUrlError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleUrlImport()} />
          </div>
          <div className="url-meta-row">
            <div className="url-field-group">
              <label>Titre (optionnel)</label>
              <input className="url-input" type="text" placeholder="Nom de la chanson" value={urlTitle} onChange={e => setUrlTitle(e.target.value)} />
            </div>
            <div className="url-field-group">
              <label>Artiste (optionnel)</label>
              <input className="url-input" type="text" placeholder="Nom de l'artiste" value={urlArtist} onChange={e => setUrlArtist(e.target.value)} />
            </div>
          </div>
          {urlError && <p className="url-error">{urlError}</p>}
          <button className="url-import-btn" onClick={handleUrlImport} disabled={urlLoading || !urlInput.trim()}>
            {urlLoading ? <><span className="btn-spinner" /> Chargement…</> : '▶ Importer et lire'}
          </button>
          <p className="url-tip">💡 Exemples : fichiers MP3 hébergés, archive.org, serveurs perso, SoundCloud (lien direct)</p>
        </div>
      )}

      {localTracks.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <p className="section-label">{localTracks.length} titre{localTracks.length > 1 ? 's' : ''} dans la bibliothèque</p>
          <div className="grid-tracks">
            {localTracks.map((track, i) => (
              <div key={track.id} className="library-track-wrap">
                <TrackRow track={track} tracks={localTracks} index={i} />
                <button className="library-remove-btn" onClick={() => removeTrack(track.id)} title="Retirer">×</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {localTracks.length === 0 && !uploading && (
        <div className="empty-state">
          <span style={{ fontSize: '2.5rem' }}>📂</span>
          <p>Ta bibliothèque est vide</p>
          <p style={{ fontSize: '0.8rem' }}>Importe des fichiers ou un lien audio pour commencer</p>
        </div>
      )}
    </div>
  );
}
