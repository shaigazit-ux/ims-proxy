// WindTlv IMS API Proxy with Full CORS Support
// Place this file in: /api/ims.js in your Vercel project

export default async function handler(req, res) {
  // ============================================
  // CORS HEADERS - Allow GitHub Pages Frontend
  // ============================================
  const allowedOrigins = [
    'https://shaigazit-ux.github.io',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For production - only allow your GitHub Pages
    res.setHeader('Access-Control-Allow-Origin', 'https://shaigazit-ux.github.io');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ============================================
  // API LOGIC
  // ============================================
  try {
    const { stationId } = req.query;
    
    if (!stationId) {
      return res.status(400).json({ 
        success: false,
        error: 'stationId is required',
        message: 'Please provide a station ID (e.g., ?stationId=44)'
      });
    }

    // Get API token from environment variable
    const apiToken = process.env.IMS_API_TOKEN;
    
    if (!apiToken) {
      console.error('IMS_API_TOKEN environment variable is not set');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
        message: 'API token not configured'
      });
    }

    // Fetch data from IMS API
    const imsUrl = `https://api.ims.gov.il/v1/envista/stations/${stationId}/data/latest`;
    
    console.log(`Fetching data for station ${stationId}...`);
    
    const response = await fetch(imsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `ApiToken ${apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`IMS API error: ${response.status}`, errorText);
      throw new Error(`IMS API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    console.log(`Successfully fetched data for station ${stationId}`);
    
    return res.status(200).json({
      success: true,
      stationId: stationId,
      timestamp: new Date().toISOString(),
      data: data
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch data from IMS',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
