# DDWeather

## Purpose
DDWeather is a lightweight weather dashboard for North Berwick. It displays:
- Live wind data
- Forecast information
- Wave and tide details

## Cache-Busting Version Value
The cache-busting value is set in `index.html` using the shared variable:
- `window.ASSET_VERSION = '20260410';`

That value is used for both frontend assets through `window.withAssetVersion(...)`, which generates:
- `css/styles.css?v=...`
- `js/app.js?v=...`

Its purpose is to force browsers to download updated CSS and JS files after deployment instead of reusing older cached versions.

When you change frontend code, update `window.ASSET_VERSION` in `index.html` to a new value, typically a date such as `20260411`, so users get the latest assets immediately.
