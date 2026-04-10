# DDWeather

## Purpose
DDWeather is a lightweight weather dashboard for North Berwick. It displays:
- Live wind data
- Forecast information
- Wave and tide details

## Cache-Busting Version Value
The cache-busting value is set in `index.html` using the shared variable:
- `window.ASSET_VERSION = '20260411';`

That value is used for both frontend assets through `window.withAssetVersion(...)`, which generates:
- `css/styles.css?v=...`
- `js/app.js?v=...`

Its purpose is to force browsers to download updated CSS and JS files after deployment instead of reusing older cached versions.

When you change frontend code, update `window.ASSET_VERSION` in `index.html` to a new value, typically a date such as `20260411`, so users get the latest assets immediately.

## Netlify Webcam Images
When the site is deployed over HTTPS, the webcam image URLs returned by the API are plain HTTP. Browsers block those direct image requests as mixed content.

To avoid that, deployed Netlify builds proxy webcam images through the function at `/.netlify/functions/webcam-image`, which fetches the allowed webcam host server-side and returns the image over HTTPS.
*** Add File: c:\Users\dhdav\Documents\CodingProjects\DDWeather\netlify.toml
[functions]
directory = "netlify/functions"
*** Add File: c:\Users\dhdav\Documents\CodingProjects\DDWeather\netlify\functions\webcam-image.js
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
