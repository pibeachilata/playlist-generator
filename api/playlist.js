const axios = require('axios');

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

    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const userId = userResponse.data.id;
