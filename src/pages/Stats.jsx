// ============================================================
// NilsJam — Historique & Stats (Wrapped style)
// ============================================================
import { usePlayer } from '../context/PlayerContext';
import './Stats.css';

function fmtTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h >= 1) return `${h}h${m > 0 ? ` ${m}min` : ''}`;
  return `${m}min`;
}
function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }).format(new Date(iso));
  } catch { return iso; }
}

export default function Stats() {
  const { history, listenStats, clearHistory, resetStats, playTrack } = usePlayer();

  const topArtists = Object.entries(listenStats.artistCounts || {})
    .sort((a,b) => b[1]-a[1])
    .slice(0, 5);

  const maxArtistSec = topArtists[0]?.[1] || 1;

  const weekSec  = listenStats.weekSeconds || 0;
  const totalSec = listenStats.totalSeconds || 0;
  const todayKey = new Date().toISOString().slice(0,10);
  const todaySec = (listenStats.dayCounts || {})[todayKey] || 0;

  // last 7 days bar chart
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0,10);
    days.push({ label: d.toLocaleDateString('fr-FR',{weekday:'short'}), sec: (listenStats.dayCounts||{})[key]||0, key });
  }
  const maxDay = Math.max(...days.map(d=>d.sec), 1);

  const wrappedMsg = () => {
    if (weekSec > 3600*10) return `Tu es un vrai mélomane ! ${fmtTime(weekSec)} cette semaine 🔥`;
    if (weekSec > 3600*3)  return `Bonne semaine musicale ! ${fmtTime(weekSec)} écoutées 🎧`;
    if (weekSec > 600)     return `${fmtTime(weekSec)} de musique cette semaine, continue ! 🎵`;
    return `Lance une piste pour commencer à tracer tes stats 🎶`;
  };

  return (
    <div className="page-container fade-in">
      <h1 className="page-title">Stats & Historique</h1>

      {/* Wrapped card */}
      <div className="stats-wrapped-card">
        <div className="stats-wrapped-glow" />
        <p className="stats-wrapped-msg">{wrappedMsg()}</p>
        <div className="stats-wrapped-pills">
          <div className="stats-pill">
            <span className="stats-pill-val">{fmtTime(todaySec) || '0min'}</span>
            <span className="stats-pill-lbl">Aujourd'hui</span>
          </div>
          <div className="stats-pill accent2">
            <span className="stats-pill-val">{fmtTime(weekSec) || '0min'}</span>
            <span className="stats-pill-lbl">Cette semaine</span>
          </div>
          <div className="stats-pill accent3">
            <span className="stats-pill-val">{fmtTime(totalSec) || '0min'}</span>
            <span className="stats-pill-lbl">Total</span>
          </div>
          <div className="stats-pill accent4">
            <span className="stats-pill-val">{history.length}</span>
            <span className="stats-pill-lbl">Titres joués</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {/* Week chart */}
        <div className="stats-card">
          <p className="stats-card-title">📅 7 derniers jours</p>
          <div className="stats-bar-chart">
            {days.map(d => (
              <div key={d.key} className="stats-bar-col">
                <div className="stats-bar-wrap">
                  <div
                    className="stats-bar-fill"
                    style={{ height:`${Math.max(4,(d.sec/maxDay)*100)}%` }}
                    title={fmtTime(d.sec)}
                  />
                </div>
                <span className="stats-bar-lbl">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top artists */}
        <div className="stats-card">
          <p className="stats-card-title">🎤 Top Artistes</p>
          {topArtists.length === 0 && <p className="stats-empty">Aucune donnée encore</p>}
          <div className="stats-artists">
            {topArtists.map(([artist, sec], i) => (
              <div key={artist} className="stats-artist-row">
                <span className="stats-artist-rank">{i+1}</span>
                <div className="stats-artist-info">
                  <p className="stats-artist-name">{artist}</p>
                  <div className="stats-artist-bar-bg">
                    <div className="stats-artist-bar-fill" style={{ width:`${(sec/maxArtistSec)*100}%` }} />
                  </div>
                </div>
                <span className="stats-artist-time">{fmtTime(sec)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="stats-history">
        <div className="stats-history-header">
          <p className="stats-card-title">🕐 Historique récent</p>
          <div style={{display:'flex',gap:'0.5rem'}}>
            {history.length > 0 && (
              <button className="stats-clear-btn" onClick={clearHistory}>Effacer</button>
            )}
            {totalSec > 0 && (
              <button className="stats-clear-btn" onClick={resetStats}>Reset stats</button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="stats-empty-state">
            <span>🎵</span>
            <p>Aucun historique</p>
            <p style={{fontSize:'0.78rem'}}>Écoute de la musique pour voir ton historique ici</p>
          </div>
        ) : (
          <div className="stats-history-list">
            {history.map((track, i) => (
              <div
                key={`${track.id}-${i}`}
                className="stats-history-item"
                onClick={() => playTrack(track, history)}
              >
                <img
                  src={track.cover || `https://ui-avatars.com/api/?name=${encodeURIComponent(track.title)}&background=111120&color=b06aff&size=80`}
                  alt={track.title}
                  className="stats-history-cover"
                />
                <div className="stats-history-info">
                  <p className="stats-history-title">{track.title}</p>
                  <p className="stats-history-artist">{track.artist}</p>
                </div>
                <span className="stats-history-date">{fmtDate(track.playedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
