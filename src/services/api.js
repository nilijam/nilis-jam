// Deezer API via proxy Netlify
const BASE = '/api/deezer';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error('API error');
  return res.json();
}

export async function searchTracks(query) {
  if (!query.trim()) return [];
  const data = await get(`/search?q=${encodeURIComponent(query)}&limit=20`);
  return (data.data || []).map(normalizeTrack);
}

export async function searchArtists(query) {
  if (!query.trim()) return [];
  const data = await get(`/search/artist?q=${encodeURIComponent(query)}&limit=10`);
  return data.data || [];
}

export async function getArtistTracks(artistId) {
  const data = await get(`/artist/${artistId}/top?limit=15`);
  return (data.data || []).map(normalizeTrack);
}

export async function getChart() {
  const data = await get('/chart/0/tracks?limit=20');
  return (data.data || []).map(normalizeTrack);
}

export async function getChartArtists() {
  const data = await get('/chart/0/artists?limit=12');
  return data.data || [];
}

export async function getChartPlaylists() {
  const data = await get('/chart/0/playlists?limit=8');
  return data.data || [];
}

export async function getPlaylistTracks(playlistId) {
  const data = await get(`/playlist/${playlistId}/tracks?limit=30`);
  return (data.data || []).map(normalizeTrack);
}

export function normalizeTrack(t) {
  return {
    id: t.id,
    title: t.title,
    artist: t.artist?.name || 'Unknown',
    artistId: t.artist?.id,
    album: t.album?.title || '',
    cover: t.album?.cover_medium || t.album?.cover || '',
    coverXl: t.album?.cover_xl || t.album?.cover_medium || '',
    duration: t.duration || 30,
    preview: t.preview || '',
    rank: t.rank,
    isLocal: false,
  };
}
