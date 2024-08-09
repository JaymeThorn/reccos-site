// src/spotify.js
const CLIENT_ID = '17bd751006b840128744b2d0a27cf4dc';
const CLIENT_SECRET = '28600b27214e47359ded238fd6389e84';
const AUTH_URL = 'https://accounts.spotify.com/api/token';
const TOP_TRACKS_PLAYLIST_URL = 'https://api.spotify.com/v1/playlists/{playlist_id}/tracks';

async function fetchAccessToken() {
  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function fetchPopularTracks() {
    try {
      const token = await fetchAccessToken();
      const playlistId = '37i9dQZF1DXcBWIGoYBM5M'; // Example playlist ID for "Top 50 Global"
      const response = await fetch(TOP_TRACKS_PLAYLIST_URL.replace('{playlist_id}', playlistId), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch tracks:', errorData);
        throw new Error('Failed to fetch tracks');
      }
  
      const data = await response.json();
      console.log('Fetched tracks:', data.items);
      return data.items.map(item => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists[0]?.name,
        cover: item.track.album.images[0]?.url || '',
        previewUrl: item.track.preview_url || '', // Ensure previewUrl is available
      }));
    } catch (error) {
      console.error('Error in fetchPopularTracks:', error);
      throw error;
    }
  }