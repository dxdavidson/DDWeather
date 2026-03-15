# DDWeather

## Purpose
DDWeather is a lightweight weather dashboard for North Berwick. It displays:
- Live wind data
- Forecast information
- Wave and tide details

## Cache-Busting Version Value
In `index.html`, static asset URLs include a version query value:
- `css/styles.css?v=20260305`
- `js/app.js?v=20260305`

The `v=20260305` part is a cache-busting value.
Its purpose is to force browsers to download updated CSS/JS files after you deploy changes, instead of reusing older cached files.

When you change frontend code, update this value (for example, to a new date like `20260316`) so users get the latest assets immediately.
