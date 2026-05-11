// ============================================================
// NilsJam — Lecteur EPUB (sans CDN externe — utilise jszip)
// Parse le fichier EPUB localement, affiche le contenu HTML
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import JSZip from 'jszip';
import './EpubReader.css';

// ── Parse un fichier EPUB avec JSZip ─────────────────────────
async function parseEpub(file) {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // 1. Lire container.xml pour trouver le fichier OPF
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) throw new Error('Fichier container.xml introuvable');

  const opfPath = containerXml.match(/full-path="([^"]+)"/)?.[1];
  if (!opfPath) throw new Error('Chemin OPF introuvable');

  const opfDir = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';

  // 2. Lire le fichier OPF (manifest + spine)
  const opfXml = await zip.file(opfPath)?.async('text');
  if (!opfXml) throw new Error('Fichier OPF introuvable');

  const parser = new DOMParser();
  const opfDoc = parser.parseFromString(opfXml, 'application/xml');

  // Métadonnées
  const title  = opfDoc.querySelector('metadata title')?.textContent  || file.name.replace('.epub','');
  const author = opfDoc.querySelector('metadata creator')?.textContent || 'Auteur inconnu';

  // Manifest : id → href
  const manifest = {};
  opfDoc.querySelectorAll('manifest item').forEach(item => {
    manifest[item.getAttribute('id')] = {
      href:      item.getAttribute('href'),
      mediaType: item.getAttribute('media-type'),
    };
  });

  // Spine : ordre de lecture
  const spineIds = Array.from(opfDoc.querySelectorAll('spine itemref'))
    .map(ref => ref.getAttribute('idref'));

  // 3. Charger chaque chapitre HTML
  const chapters = [];
  for (const id of spineIds) {
    const item = manifest[id];
    if (!item) continue;
    const fullPath = opfDir + item.href;
    const content  = await zip.file(fullPath)?.async('text') ?? zip.file(decodeURIComponent(fullPath))?.async('text');
    if (content == null) continue;

    // Résoudre les images inline en base64
    const resolved = await resolveAssets(content, zip, opfDir, fullPath);
    chapters.push({ id, href: item.href, html: resolved });
  }

  // 4. Table des matières depuis NCX ou nav
  const ncxId  = opfDoc.querySelector('spine')?.getAttribute('toc');
  const ncxHref = ncxId ? manifest[ncxId]?.href : null;
  let toc = [];
  if (ncxHref) {
    const ncxText = await zip.file(opfDir + ncxHref)?.async('text');
    if (ncxText) {
      const ncxDoc = parser.parseFromString(ncxText, 'application/xml');
      toc = Array.from(ncxDoc.querySelectorAll('navPoint')).map((np, i) => ({
        label: np.querySelector('navLabel text')?.textContent?.trim() || `Chapitre ${i+1}`,
        src:   np.querySelector('content')?.getAttribute('src')?.split('#')[0] || '',
        index: i,
      }));
    }
  }

  // Couverture
  let coverUrl = null;
  const coverId   = opfDoc.querySelector('meta[name="cover"]')?.getAttribute('content');
  const coverItem = coverId ? manifest[coverId] : Object.values(manifest).find(m => m.mediaType?.startsWith('image/') && /cover/i.test(m.href));
  if (coverItem) {
    const coverPath = opfDir + coverItem.href;
    const coverData = await zip.file(coverPath)?.async('base64');
    if (coverData) coverUrl = `data:${coverItem.mediaType};base64,${coverData}`;
  }

  return { title, author, chapters, toc, coverUrl };
}

// Convertit les assets (images, CSS) référencés en data-URI inline
async function resolveAssets(html, zip, opfDir, chapterPath) {
  const chapterDir = chapterPath.includes('/')
    ? chapterPath.slice(0, chapterPath.lastIndexOf('/') + 1)
    : opfDir;

  // Images
  html = await replaceAsync(html, /src="([^"]+)"/g, async (match, src) => {
    if (src.startsWith('data:') || src.startsWith('http')) return match;
    const imgPath = resolvePath(chapterDir, src);
    const file = zip.file(imgPath) || zip.file(decodeURIComponent(imgPath));
    if (!file) return match;
    const ext  = src.split('.').pop().toLowerCase();
    const mime = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', svg:'image/svg+xml', webp:'image/webp' }[ext] || 'image/*';
    const b64  = await file.async('base64');
    return `src="data:${mime};base64,${b64}"`;
  });

  return html;
}

async function replaceAsync(str, regex, asyncFn) {
  const promises = [];
  str.replace(regex, (match, ...args) => { promises.push(asyncFn(match, ...args)); return match; });
  const results = await Promise.all(promises);
  return str.replace(regex, () => results.shift());
}

function resolvePath(base, relative) {
  if (relative.startsWith('/')) return relative.slice(1);
  const parts = (base + relative).split('/');
  const resolved = [];
  for (const p of parts) {
    if (p === '..') resolved.pop();
    else if (p !== '.') resolved.push(p);
  }
  return resolved.join('/');
}

// ── Composant principal ───────────────────────────────────────
const THEMES = {
  dark:  { bg: '#0d0d16', text: '#e8e6ff', link: '#b06aff' },
  sepia: { bg: '#1c1408', text: '#d4c89a', link: '#c49a3c' },
  light: { bg: '#f8f5ee', text: '#1a1a2e', link: '#7c3aed' },
};

export default function EpubReader() {
  const [bookData,    setBookData]    = useState(null);   // { title, author, chapters, toc, coverUrl }
  const [chapterIdx,  setChapterIdx]  = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [fontSize,    setFontSize]    = useState(100);
  const [theme,       setTheme]       = useState('dark');
  const [showToc,     setShowToc]     = useState(false);
  const [fileName,    setFileName]    = useState('');

  const fileRef    = useRef(null);
  const iframeRef  = useRef(null);

  // ── Ouvre un fichier EPUB ─────────────────────────────────
  const openEpub = useCallback(async (file) => {
    if (!file?.name.endsWith('.epub')) {
      setError('Merci de sélectionner un fichier .epub valide.');
      return;
    }
    setLoading(true);
    setError('');
    setBookData(null);
    setFileName(file.name);
    setChapterIdx(0);

    try {
      const data = await parseEpub(file);
      if (!data.chapters.length) throw new Error('Aucun chapitre trouvé dans ce fichier EPUB.');
      setBookData(data);

      // Reprend la progression
      const saved = parseInt(localStorage.getItem(`epub_ch_${file.name}`) || '0', 10);
      setChapterIdx(Math.min(saved, data.chapters.length - 1));
    } catch (e) {
      setError('Erreur : ' + (e.message || 'Impossible de lire ce fichier EPUB.'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Drag & drop ───────────────────────────────────────────
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await openEpub(file);
  }, [openEpub]);

  // ── Sauvegarde progression ────────────────────────────────
  useEffect(() => {
    if (fileName) localStorage.setItem(`epub_ch_${fileName}`, chapterIdx);
  }, [chapterIdx, fileName]);

  // ── Injecte le HTML dans l'iframe avec le thème ──────────
  useEffect(() => {
    if (!bookData || !iframeRef.current) return;
    const chapter = bookData.chapters[chapterIdx];
    if (!chapter) return;

    const t = THEMES[theme];
    const doc = iframeRef.current.contentDocument;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          background: ${t.bg};
          color: ${t.text};
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: ${fontSize}%;
          line-height: 1.85;
          padding: 32px 48px;
          max-width: 780px;
          margin: 0 auto;
        }
        h1,h2,h3,h4,h5 {
          font-family: 'Georgia', serif;
          margin: 1.5em 0 0.6em;
          line-height: 1.3;
          color: ${t.text};
        }
        p { margin-bottom: 1em; text-align: justify; }
        a { color: ${t.link}; }
        img { max-width: 100%; height: auto; border-radius: 6px; margin: 12px auto; display: block; }
        blockquote { border-left: 3px solid ${t.link}; padding-left: 16px; opacity: 0.8; margin: 1em 0; }
        pre, code { font-family: monospace; background: rgba(128,128,128,0.1); padding: 2px 6px; border-radius: 4px; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        td, th { border: 1px solid rgba(128,128,128,0.3); padding: 6px 10px; }
        @media (max-width: 600px) { html, body { padding: 20px 18px; } }
      </style>
    </head><body>${chapter.html}</body></html>`);
    doc.close();
  }, [bookData, chapterIdx, theme, fontSize]);

  // ── Keyboard navigation ───────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') setChapterIdx(i => Math.min(i + 1, (bookData?.chapters.length ?? 1) - 1));
      if (e.key === 'ArrowLeft')  setChapterIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [bookData]);

  const chapter = bookData?.chapters[chapterIdx];
  const progress = bookData ? Math.round(((chapterIdx + 1) / bookData.chapters.length) * 100) : 0;

  return (
    <div className="epub-page fade-in">

      {/* ── Header ── */}
      <div className="epub-header">
        <div className="epub-title-block">
          <h1 className="page-title"><span className="epub-icon">📖</span> Lecteur de livres</h1>
          {bookData && (
            <p className="epub-book-info">
              <strong>{bookData.title}</strong>
              {bookData.author && <span> · {bookData.author}</span>}
            </p>
          )}
        </div>

        {bookData && (
          <div className="epub-controls">
            {/* Taille de police */}
            <div className="epub-font-ctrl">
              <button onClick={() => setFontSize(f => Math.max(70, f - 10))}>A−</button>
              <span>{fontSize}%</span>
              <button onClick={() => setFontSize(f => Math.min(160, f + 10))}>A+</button>
            </div>

            {/* Thèmes */}
            <div className="epub-themes">
              {Object.keys(THEMES).map(t => (
                <button key={t} className={`theme-dot theme-${t} ${theme === t ? 'active' : ''}`}
                  onClick={() => setTheme(t)} title={t} />
              ))}
            </div>

            {/* TOC */}
            {bookData.toc.length > 0 && (
              <button className="epub-toc-btn" onClick={() => setShowToc(s => !s)}>
                ☰ Chapitres
              </button>
            )}

            {/* Changer de livre */}
            <button className="epub-change-btn" onClick={() => fileRef.current?.click()}>
              📂 Autre livre
            </button>
          </div>
        )}
      </div>

      {/* ── Hidden file input ── */}
      <input ref={fileRef} type="file" accept=".epub" hidden
        onChange={e => { const f = e.target.files[0]; if (f) openEpub(f); e.target.value=''; }} />

      {/* ── Drop zone si pas de livre ── */}
      {!bookData && !loading && (
        <div className="epub-drop-zone"
          onDragOver={e => e.preventDefault()} onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}>
          <div className="epub-drop-icon">📚</div>
          <p className="epub-drop-title">Glisse un fichier EPUB ici</p>
          <p className="epub-drop-hint">ou clique pour parcourir tes fichiers</p>
          <p className="epub-drop-sub">Le lecteur s'ouvre dans l'app — continue d'écouter la musique pendant ta lecture !</p>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="epub-loading">
          <div className="epub-spinner" />
          <p>Analyse du fichier EPUB…</p>
        </div>
      )}

      {/* ── Erreur ── */}
      {error && <div className="epub-error">{error}</div>}

      {/* ── Reader ── */}
      {bookData && !loading && (
        <div className="epub-reader-wrap">

          {/* TOC sidebar */}
          {showToc && (
            <aside className="epub-toc">
              <h3>Chapitres</h3>
              <ul>
                {bookData.toc.length > 0 ? bookData.toc.map((item, i) => (
                  <li key={i}>
                    <button
                      className={chapterIdx === item.index ? 'toc-active' : ''}
                      onClick={() => { setChapterIdx(item.index); setShowToc(false); }}
                    >{item.label}</button>
                  </li>
                )) : bookData.chapters.map((_, i) => (
                  <li key={i}>
                    <button className={chapterIdx === i ? 'toc-active' : ''} onClick={() => { setChapterIdx(i); setShowToc(false); }}>
                      Chapitre {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Viewer */}
          <div className="epub-viewer-container" style={{ background: THEMES[theme].bg }}>
            <iframe ref={iframeRef} className="epub-viewer" title="Lecteur EPUB" />

            {/* Flèches */}
            <button className="epub-nav epub-prev"
              onClick={() => setChapterIdx(i => Math.max(i-1, 0))}
              disabled={chapterIdx === 0}>‹</button>
            <button className="epub-nav epub-next"
              onClick={() => setChapterIdx(i => Math.min(i+1, bookData.chapters.length-1))}
              disabled={chapterIdx === bookData.chapters.length - 1}>›</button>

            {/* Barre de progression */}
            <div className="epub-progress-bar">
              <div className="epub-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Info chapitre */}
            <div className="epub-chapter-info">
              Chapitre {chapterIdx + 1} / {bookData.chapters.length} · {progress}%
            </div>
          </div>
        </div>
      )}

      {/* ── Tip ── */}
      {!bookData && !loading && (
        <div className="epub-music-tip">
          <span>🎵</span>
          <p>Lance une musique dans le player, puis ouvre un livre — les deux fonctionnent simultanément !</p>
        </div>
      )}
    </div>
  );
}
