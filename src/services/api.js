// iTunes Search API — gratuite, no CORS, fonctionne en production
const BASE = 'https://itunes.apple.com';

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('API error');
  return res.json();
}

function normalizeItunesTrack(t) {
  return {
    id: t.trackId || t.collectionId,
    title: t.trackName || t.collectionName || 'Unknown',
    artist: t.artistName || 'Unknown',
    artistId: t.artistId,
    album: t.collectionName || '',
    cover: (t.artworkUrl100 || '').replace('100x100', '300x300'),
    coverXl: (t.artworkUrl100 || '').replace('100x100', '600x600'),
    duration: Math.round((t.trackTimeMillis || 30000) / 1000),
    preview: t.previewUrl || '',
    rank: 0,
    isLocal: false,
  };
}

export async function searchTracks(query) {
  if (!query.trim()) return [];
  const data = await get(`${BASE}/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20&country=FR`);
  return (data.results || []).filter(t => t.previewUrl).map(normalizeItunesTrack);
}

export async function searchArtists(query) {
  if (!query.trim()) return [];
  const data = await get(`${BASE}/search?term=${encodeURIComponent(query)}&media=music&entity=musicArtist&limit=10&country=FR`);
  return (data.results || []).map(a => ({
    id: a.artistId,
    name: a.artistName,
    picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.artistName)}&background=111120&color=b06aff&size=200`,
    picture_medium: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.artistName)}&background=111120&color=b06aff&size=200`,
  }));
}

export async function getArtistTracks(artistId) {
  const data = await get(`${BASE}/lookup?id=${artistId}&entity=song&limit=15&country=FR`);
  return (data.results || []).filter(t => t.previewUrl && t.trackId).map(normalizeItunesTrack);
}

export async function getChart() {
  // Top hits via iTunes
  const queries = ['afrobeats 2024', 'pop hits 2024', 'rnb 2024'];
  const q = queries[Math.floor(Date.now() / 86400000) % queries.length];
  const data = await get(`${BASE}/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=20&country=FR`);
  return (data.results || []).filter(t => t.previewUrl).map(normalizeItunesTrack);
}

export async function getChartArtists() {
  const data = await get(`${BASE}/search?term=top+artists+2024&media=music&entity=musicArtist&limit=12&country=FR`);
  return (data.results || []).map(a => ({
    id: a.artistId,
    name: a.artistName,
    picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.artistName)}&background=111120&color=b06aff&size=200`,
    picture_medium: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.artistName)}&background=111120&color=b06aff&size=200`,
  }));
}

export async function getChartPlaylists() { return []; }
export async function getPlaylistTracks(playlistId) { return []; }

export { normalizeItunesTrack as normalizeTrack };