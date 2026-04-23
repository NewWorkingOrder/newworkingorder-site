module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  var tunnelBase = process.env.AMS_CONSOLE_TUNNEL_URL || '';
  var tunnelKey = process.env.AMS_CONSOLE_TUNNEL_KEY || '';

  if (!tunnelBase) {
    return response.status(503).json({ error: 'AMS Console backend not configured' });
  }

  var body = request.body || {};

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch (error) {
      body = {};
    }
  }

  var message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!message) {
    return response.status(400).json({ error: 'Missing message' });
  }

  var target = tunnelBase.replace(/\/+$/, '') + '/chat';

  try {
    var upstream = await fetch(target, {
      method: 'POST',
      headers: Object.assign(
        { 'Content-Type': 'application/json' },
        tunnelKey ? { 'x-ams-console-key': tunnelKey } : {}
      ),
      body: JSON.stringify({ message: message })
    });

    var contentType = upstream.headers.get('content-type') || 'application/json; charset=utf-8';
    var payload = await upstream.text();

    response.status(upstream.status);
    response.setHeader('Content-Type', contentType);
    return response.send(payload);
  } catch (error) {
    return response.status(502).json({ error: 'AMS Console backend unavailable' });
  }
};
