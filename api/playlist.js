const playlists = {
  tranquilo_trabajar: [
    { titulo: 'Maps', artista: 'Yeah Yeah Yeahs' },
    { titulo: 'Bloom', artista: 'The Xx' },
    { titulo: 'Holocene', artista: 'Bon Iver' },
    { titulo: 'New Slang', artista: 'The Shins' },
    { titulo: 'Naked As We Came', artista: 'Iron & Wine' },
    { titulo: 'Morning Bell', artista: 'Radiohead' },
    { titulo: 'Inertia Creeps', artista: 'Massive Attack' },
    { titulo: 'Pyramid Song', artista: 'Radiohead' },
    { titulo: 'Falling Slowly', artista: 'Glen Hansard' },
    { titulo: 'Arawak', artista: 'Bonobo' },
  ],
  feliz_trabajar: [
    { titulo: 'Electric Feel', artista: 'MGMT' },
    { titulo: 'Such Great Heights', artista: 'The Postal Service' },
    { titulo: 'Two Weeks', artista: 'Grizzly Bear' },
    { titulo: 'Home', artista: 'Edward Sharpe' },
    { titulo: 'Kids', artista: 'Current Joys' },
    { titulo: 'Naive', artista: 'The Kooks' },
    { titulo: 'Young Folks', artista: 'Peter Bjorn and John' },
    { titulo: 'Take Me Out', artista: 'Franz Ferdinand' },
    { titulo: 'Float On', artista: 'Modest Mouse' },
    { titulo: 'Someday', artista: 'The Strokes' },
  ],
  reflexivo_leer: [
    { titulo: 'Pyramid Song', artista: 'Radiohead' },
    { titulo: 'Nude', artista: 'Radiohead' },
    { titulo: 'Fake Plastic Trees', artista: 'Radiohead' },
    { titulo: 'Codex', artista: 'Radiohead' },
    { titulo: 'Paranoid Android', artista: 'Radiohead' },
    { titulo: 'Reckoner', artista: 'Radiohead' },
    { titulo: 'Street Spirit', artista: 'Radiohead' },
    { titulo: 'Morning Bell', artista: 'Radiohead' },
    { titulo: 'Bloom', artista: 'The Xx' },
    { titulo: 'Maps', artista: 'Yeah Yeah Yeahs' },
  ],
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { estado, actividad, accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const key = `${estado}_${actividad}`;
    const songs = playlists[key] || playlists.tranquilo_trabajar;

    // Obtener usuario de Spotify
    const userResp = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const userData = await userResp.json();
    const userId = userData.id;

    // Crear playlist
    const playlistResp = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${estado} - ${actividad}`,
          description: 'Generada con Playlist Generator',
          public: false,
        }),
      }
    );
    const playlistData = await playlistResp.json();
    const playlistId = playlistData.id;

    // Buscar y agregar canciones
    const uris = [];
    for (const song of songs) {
      try {
        const searchResp = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(song.titulo + ' ' + song.artista)}&type=track&limit=1`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const searchData = await searchResp.json();
        if (searchData.tracks.items.length > 0) {
          uris.push(searchData.tracks.items[0].uri);
        }
      } catch (error) {
        console.error('Error searching:', error);
      }
    }

    // Agregar canciones a playlist
    if (uris.length > 0) {
      await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris }),
        }
      );
    }

    return res.status(200).json({
      success: true,
      playlistId,
      playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
      cancionesAgregadas: uris.length,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
