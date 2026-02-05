export default async function handler(req, res) {
  // CORS - אפשר הכל
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { stationId } = req.query;
  
  if (!stationId) {
    return res.status(400).json({ error: 'Station ID required' });
  }

  const apiKey = process.env.IMS_API_KEY;

  try {
    const response = await fetch(`https://api.ims.gov.il/v1/envista/stations/${stationId}/data/latest`, {
      headers: {
        'Authorization': `ApiToken ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'IMS API error' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
