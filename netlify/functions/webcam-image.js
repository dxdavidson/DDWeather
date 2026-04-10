const ALLOWED_HOSTS = new Set(['88.97.23.70']);

exports.handler = async function handler(event) {
  const src = event.queryStringParameters && event.queryStringParameters.src;
  if (!src) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Missing src query parameter.'
    };
  }

  let targetUrl;
  try {
    targetUrl = new URL(src);
  } catch (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Invalid src URL.'
    };
  }

  if (targetUrl.protocol !== 'http:' || !ALLOWED_HOSTS.has(targetUrl.hostname)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Unsupported webcam image source.'
    };
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: { Accept: 'image/*' }
    });

    if (!upstream.ok) {
      return {
        statusCode: upstream.status,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: `Upstream image request failed with HTTP ${upstream.status}.`
      };
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const contentType = upstream.headers.get('content-type') || 'image/jpeg';

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300'
      },
      body: Buffer.from(arrayBuffer).toString('base64')
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Unable to fetch webcam image.'
    };
  }
};