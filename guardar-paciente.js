// api/guardar-paciente.js
// Este archivo recibe los datos del formulario y los manda a Google Sheets.
// Al hacerlo desde el servidor (Vercel) se evita el bloqueo CORS del navegador.

export default async function handler(req, res) {
  // Permitir CORS para que tu página pueda llamar a este endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const datos = req.body;

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzmXvAt-y2ZWX5d8TUDyqX59ZG3FQqcOJv2PKXEmfrityQFiXU_VtcKX7xaDz2gS9ReJA/exec';

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...datos,
        fecha: new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
      }),
    });

    const result = await response.json();
    return res.status(200).json({ ok: true, result });

  } catch (error) {
    console.error('Error al guardar en Sheets:', error);
    return res.status(500).json({ error: 'Error al guardar los datos' });
  }
}
