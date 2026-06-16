module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { estado, actividad, accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Obtener usuario
    const userResp = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    
    if (!userResp.ok) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const user = await userResp.json();

    // Crear playlist
    const createResp = await fetch(
      `https://api.spotify.com/v1/users/${user.id}/playlists`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${estado} - ${actividad}`,
          public: false,
        }),
      }
    );

    const playlist = await createResp.json();
    
    if (!playlist.id) {
      return res.status(400).json({ error: JSON.stringify(playlist) });
    }

    return res.status(200).json({
      success: true,
      playlistId: playlist.id,
      playlistUrl: `https://open.spotify.com/playlist/${playlist.id}`,
      cancionesAgregadas: 0,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
