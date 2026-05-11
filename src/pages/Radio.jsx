// ============================================================
// NilsJam Radio — Génération de playlist par ambiance visuelle
// Chaque scène = palette + genres Deezer + animation de fond
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { searchTracks } from '../services/api';
import TrackRow from '../components/TrackRow';
import './Radio.css';

// ── Définition des scènes ───────────────────────────────────
const SCENES = [
  {
    id: 'city-night',
    label: 'Nuit en ville',
    emoji: '🌆',
    description: 'Néons, asphalte mouillé, beats urbains',
    queries: ['lofi hip hop night', 'urban beats', 'city vibes electronic'],
    palette: { primary: '#7B5EA7', secondary: '#E84393', bg1: '#0a0015', bg2: '#15003a', accent: '#ff6ec7' },
    particles: 'rain',
  },
  {
    id: 'sunset-beach',
    label: 'Plage coucher de soleil',
    emoji: '🏖️',
    description: 'Vagues, sable chaud, reggaeton doux',
    queries: ['beach sunset chill', 'tropical house', 'reggaeton suave'],
    palette: { primary: '#FF6B35', secondary: '#FFD23F', bg1: '#1a0800', bg2: '#2d1500', accent: '#ff9f45' },
    particles: 'waves',
  },
  {
    id: 'rainy-home',
    label: 'Pluie chez soi',
    emoji: '☔',
    description: 'Cocooning, jazz acoustique, plaid',
    queries: ['rainy day jazz', 'acoustic cozy', 'lo-fi rain'],
    palette: { primary: '#4A90D9', secondary: '#7EC8E3', bg1: '#050d1a', bg2: '#0a1628', accent: '#7ec8e3' },
    particles: 'drops',
  },
  {
    id: 'preSoiree',
    label: 'Pré-soirée',
    emoji: '🎉',
    description: 'Montée en puissance, heure dorée',
    queries: ['pregame party hits', 'hype playlist', 'dance pop 2024'],
    palette: { primary: '#FF3CAC', secondary: '#784BA0', bg1: '#0d0015', bg2: '#1a0030', accent: '#ff3cac' },
    particles: 'confetti',
  },
  {
    id: 'calm-forest',
    label: 'Forêt calme',
    emoji: '🌿',
    description: 'Nature, ambient, respiration',
    queries: ['forest ambient meditation', 'nature sounds music', 'calm instrumental'],
    palette: { primary: '#2ECC71', secondary: '#1ABC9C', bg1: '#020d07', bg2: '#041a0e', accent: '#2ecc71' },
    particles: 'leaves',
  },
  {
    id: 'road-trip',
    label: 'Road trip',
    emoji: '🚗',
    description: 'Route ouverte, fenêtre baissée, liberté',
    queries: ['road trip rock', 'driving playlist', 'indie road trip'],
    palette: { primary: '#F39C12', secondary: '#E74C3C', bg1: '#0d0800', bg2: '#1a1000', accent: '#f39c12' },
    particles: 'stars',
  },
];

// ── Composant principal ─────────────────────────────────────
export default function Radio() {
  const [activeScene, setActiveScene]   = useState(null);
  const [tracks,      setTracks]        = useState([]);
  const [loading,     setLoading]       = useState(false);
  const [error,       setError]         = useState('');
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const { playTrack } = usePlayer();

  // ── Charge la playlist quand une scène est sélectionnée ──
  useEffect(() => {
    if (!activeScene) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      setTracks([]);
      try {
        // Combine plusieurs requêtes pour diversifier
        const query = activeScene.queries[Math.floor(Math.random() * activeScene.queries.length)];
        const results = await searchTracks(query);
        if (!cancelled) setTracks(results.slice(0, 15));
      } catch {
        if (!cancelled) setError('Impossible de charger la playlist. Vérifie ta connexion.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [activeScene]);

  // ── Animation canvas ─────────────────────────────────────
  useEffect(() => {
    if (!activeScene || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const palette = activeScene.palette;

    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = buildParticles(activeScene.particles, canvas, palette);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(canvas); p.draw(ctx); });
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    const onResize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [activeScene]);

  // ── Auto-play premier titre ───────────────────────────────
  const handlePlayAll = () => {
    if (tracks.length) playTrack(tracks[0], tracks);
  };

  const scene = activeScene;

  return (
    <div className="radio-page fade-in">

      {/* ── Hero avec canvas animé ── */}
      <div
        className="radio-hero"
        style={scene ? {
          '--scene-primary': scene.palette.primary,
          '--scene-secondary': scene.palette.secondary,
          '--scene-accent': scene.palette.accent,
          background: `linear-gradient(135deg, ${scene.palette.bg1} 0%, ${scene.palette.bg2} 100%)`,
        } : {}}
      >
        <canvas ref={canvasRef} className="radio-canvas" />

        <div className="radio-hero-content">
          <p className="radio-eyebrow">✦ NilsJam Radio</p>
          <h1 className="radio-title">
            {scene ? (
              <><span className="scene-emoji">{scene.emoji}</span> {scene.label}</>
            ) : (
              <>Choisis ton <span className="radio-title-accent">ambiance</span></>
            )}
          </h1>
          {scene && <p className="radio-desc">{scene.description}</p>}
        </div>
      </div>

      {/* ── Sélecteur de scènes ── */}
      <div className="radio-scenes">
        {SCENES.map(s => (
          <button
            key={s.id}
            className={`scene-btn ${activeScene?.id === s.id ? 'active' : ''}`}
            onClick={() => setActiveScene(s)}
            style={{ '--s-color': s.palette.primary, '--s-glow': s.palette.accent }}
          >
            <span className="scene-btn-emoji">{s.emoji}</span>
            <span className="scene-btn-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── Playlist générée ── */}
      {scene && (
        <div className="radio-playlist">
          <div className="radio-playlist-header">
            <div>
              <h2 className="radio-playlist-title">
                Playlist générée
                {!loading && tracks.length > 0 && <span className="track-count">{tracks.length} titres</span>}
              </h2>
              <p className="radio-playlist-sub">Basée sur l'ambiance · {scene.label}</p>
            </div>
            {tracks.length > 0 && (
              <button className="radio-play-all" onClick={handlePlayAll}
                style={{ background: scene.palette.primary }}>
                ▶ Tout jouer
              </button>
            )}
          </div>

          {loading && (
            <div className="radio-loading">
              <div className="radio-spinner" style={{ borderTopColor: scene.palette.primary }} />
              <p>Génération de ta playlist…</p>
            </div>
          )}

          {error && <p className="radio-error">{error}</p>}

          {!loading && !error && tracks.length > 0 && (
            <div className="grid-tracks">
              {tracks.map((t, i) => (
                <TrackRow key={t.id} track={t} tracks={tracks} index={i} />
              ))}
            </div>
          )}

          {!loading && !error && tracks.length === 0 && (
            <div className="radio-empty">
              <span>🎵</span>
              <p>Aucun titre trouvé pour cette ambiance</p>
            </div>
          )}
        </div>
      )}

      {!scene && (
        <div className="radio-prompt">
          <p>Sélectionne une scène ci-dessus pour générer ta playlist automatique</p>
        </div>
      )}
    </div>
  );
}

// ── Usine à particules ────────────────────────────────────────
function buildParticles(type, canvas, palette) {
  const count = type === 'confetti' ? 60 : 35;
  return Array.from({ length: count }, () => makeParticle(type, canvas, palette));
}

function rand(min, max) { return Math.random() * (max - min) + min; }

function makeParticle(type, canvas, palette) {
  const colors = [palette.primary, palette.secondary, palette.accent, '#ffffff'];
  const base = {
    x: rand(0, canvas.width),
    y: rand(0, canvas.height),
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: rand(0.2, 0.8),
    size: rand(1, 4),
    speed: rand(0.3, 1.5),
  };

  if (type === 'rain' || type === 'drops') {
    return {
      ...base, size: rand(0.5, 1.5), speed: rand(2, 5),
      angle: type === 'rain' ? 0.3 : 0,
      update(c) {
        this.y += this.speed;
        this.x += type === 'rain' ? this.angle : 0;
        if (this.y > c.height) { this.y = -10; this.x = rand(0, c.width); }
      },
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity * 0.6;
        ctx.strokeStyle = this.color;
        ctx.lineWidth   = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + (type === 'rain' ? 4 : 0), this.y + 12);
        ctx.stroke();
        ctx.restore();
      },
    };
  }

  if (type === 'waves') {
    return {
      ...base, phase: rand(0, Math.PI * 2), freq: rand(0.01, 0.03),
      update() { this.phase += this.freq; this.y += Math.sin(this.phase) * 0.3; },
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity * 0.5;
        ctx.fillStyle   = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
    };
  }

  if (type === 'confetti') {
    return {
      ...base, rotation: rand(0, 360), rotSpeed: rand(-3, 3),
      width: rand(4, 10), height: rand(3, 6),
      update(c) {
        this.y += this.speed;
        this.rotation += this.rotSpeed;
        if (this.y > c.height) { this.y = -20; this.x = rand(0, c.width); }
      },
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle   = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
      },
    };
  }

  if (type === 'leaves') {
    return {
      ...base, rotation: rand(0, 360), rotSpeed: rand(-1, 1),
      drift: rand(-0.5, 0.5), size: rand(3, 7),
      update(c) {
        this.y += this.speed * 0.5;
        this.x += this.drift;
        this.rotation += this.rotSpeed;
        if (this.y > c.height) { this.y = -20; this.x = rand(0, c.width); }
      },
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity * 0.7;
        ctx.fillStyle   = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
    };
  }

  // stars (road trip)
  return {
    ...base, twinkle: rand(0, Math.PI * 2), twinkleSpeed: rand(0.02, 0.06),
    update() { this.twinkle += this.twinkleSpeed; },
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = ((Math.sin(this.twinkle) + 1) / 2) * 0.8 + 0.1;
      ctx.fillStyle   = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
  };
}
