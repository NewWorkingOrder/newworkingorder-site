module.exports = async function handler(request, response) {
  var tunnelBase = process.env.AMS_CONSOLE_TUNNEL_URL || '';
  var tunnelKey = process.env.AMS_CONSOLE_TUNNEL_KEY || '';

  if (request.method === 'GET') {
    if (!tunnelBase) {
      return response.status(503).json({ ok: false, error: 'AMS Console backend not configured', envConfigured: false });
    }

    var healthTarget = tunnelBase.replace(/\/+$/, '') + '/health';

    try {
      var healthResponse = await fetch(healthTarget, {
        method: 'GET',
        headers: tunnelKey ? { 'x-ams-console-key': tunnelKey } : {}
      });

      var rawHealth = await healthResponse.text();
      var parsedHealth = rawHealth;
      try {
        parsedHealth = JSON.parse(rawHealth);
      } catch (error) {}

      return response.status(200).json({
        ok: true,
        envConfigured: true,
        upstreamStatus: healthResponse.status,
        upstreamHealth: parsedHealth
      });
    } catch (error) {
      return response.status(502).json({
        ok: false,
        envConfigured: true,
        error: 'AMS Console backend unavailable',
        details: String(error)
      });
    }
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

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
