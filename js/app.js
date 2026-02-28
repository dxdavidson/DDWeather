// Placeholder API URL - replace with actual swell height forecast API
const LATITUDE = 51.3; // Example: North Berwick latitude
const LONGITUDE = -2.7; // Example: North Berwick longitude

// API Base URL selection: default is 'railway'
// Switch to local proxy by adding ?wind=local to the page URL or by setting window.WIND_API_ENV = 'local'.
const WIND_API_ENV = (new URLSearchParams(window.location.search).get('wind')) || (window.WIND_API_ENV) || 'railway';
const API_BASE_URL = WIND_API_ENV === 'local' ? 'http://localhost:3000' : 'https://ddlivenbwind-production.up.railway.app';

// API endpoint suffixes
const ENDPOINTS = {
  livewind: '/api/livewind',
  weatherforecast: '/api/weatherforecast',
  tides: '/api/tides',
  waves: '/api/waves'
};

// Template map for Open-Meteo weather codes (edit icon filenames later as needed).
// Keep keys as the exact weather_code values returned by the API.
//icons from https://weather-sense.leftium.com/wmo-codes
const WEATHER_CODE_ICON_MAP = {
  0: '0_sunny.png',              // Clear sky
  1: '1_mostly_sunny.png',       // Mainly clear
  2: '2_partly_cloudy.png',      // Partly cloudy
  3: '3_mostly_cloudy_day.png',  // Overcast
  45: '45_cloudy.png',           // Fog
  48: '48_cloudy.png',           // Depositing rime fog
  51: '51_rain_light.png',       // Light drizzle
  53: '53_rain_light.png',       // Moderate drizzle
  55: '55_rain_light.png',       // Dense drizzle
  56: '56_snow_s_rain.png',      // Light freezing drizzle
  57: '57_snow_s_rain.png',      // Dense freezing drizzle
  61: '61_rain.png',             // Slight rain
  63: '63_rain_heavy.png',       // Moderate rain
  65: '65_rain_heavy.png',       // Heavy rain
  66: '66_rain_s_snow.png',      // Light freezing rain
  67: '67_rain_s_snow.png',      // Heavy freezing rain
  71: '71_snow_light.png',       // Slight snowfall
  73: '73_snow.png',             // Moderate snowfall
  75: '75_snow_heavy.png',       // Heavy snowfall
  77: '77_snow_s_cloudy.png',    // Snow grains
  80: '80_sunny_s_rain.png',     // Slight rain showers
  81: '81_rain_s_sunny.png',     // Moderate rain showers
  82: '82_rain_s_sunny.png',     // Violent rain showers
  85: '85_snow_s_cloudy.png',    // Slight snow showers
  86: '86_snow_s_cloudy.png',    // Heavy snow showers
  95: '95_thunderstorms.png',    // Thunderstorm
  96: '96_thunderstorms.png',    // Thunderstorm with slight hail
  99: '99_thunderstorms.png'     // Thunderstorm with heavy hail
};

// Night icon map for Open-Meteo weather codes.
// Keep keys aligned with WEATHER_CODE_ICON_MAP so both day and night variants are available.
const WEATHER_CODE_ICON_MAP_NIGHT = {
  0: '0_clear_night.png',          // Clear sky (night)
  1: '1_mostly_clear_night.png',   // Mainly clear (night)
  2: '2_partly_cloudy_night.png',  // Partly cloudy (night)
  3: '3_mostly_cloudy_night.png',  // Overcast
  45: '45_cloudy.png',             // Fog
  48: '48_cloudy.png',             // Depositing rime fog
  51: '51_rain_light.png',         // Light drizzle
  53: '53_rain_light.png',         // Moderate drizzle
  55: '55_rain_light.png',         // Dense drizzle
  56: '56_snow_s_rain.png',        // Light freezing drizzle
  57: '57_snow_s_rain.png',        // Dense freezing drizzle
  61: '61_rain.png',               // Slight rain
  63: '63_rain_heavy.png',         // Moderate rain
  65: '65_rain_heavy.png',         // Heavy rain
  66: '66_rain_s_snow.png',        // Light freezing rain
  67: '67_rain_s_snow.png',        // Heavy freezing rain
  71: '71_snow_light.png',         // Slight snowfall
  73: '73_snow.png',               // Moderate snowfall
  75: '75_snow_heavy.png',         // Heavy snowfall
  77: '77_snow_s_cloudy.png',      // Snow grains
  80: '80_cloudy_s_rain.png',      // Slight rain showers
  81: '81_rain_s_cloudy.png',      // Moderate rain showers
  82: '82_rain_s_cloudy.png',      // Violent rain showers
  85: '85_snow_s_cloudy.png',      // Slight snow showers
  86: '86_snow_s_cloudy.png',      // Heavy snow showers
  95: '95_thunderstorms.png',      // Thunderstorm
  96: '96_thunderstorms.png',      // Thunderstorm with slight hail
  99: '99_thunderstorms.png'       // Thunderstorm with heavy hail
};

const WEATHER_CODE_TOOLTIP_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

const WEATHER_CODE_TOOLTIP_MAP_NIGHT = {
  0: 'Clear sky (night)',
  1: 'Mainly clear (night)',
  2: 'Partly cloudy (night)',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

let sunriseSunsetByDate = {};

function parseTimeToMinutes(value) {
  if (value === null || value === undefined || value === '') return null;
  const str = String(value).trim();
  if (!str) return null;

  // HH:mm or HH:mm:ss
  const hhmmMatch = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hhmmMatch) {
    const hours = Number(hhmmMatch[1]);
    const minutes = Number(hhmmMatch[2]);
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
      return (hours * 60) + minutes;
    }
  }

  // ISO timestamp or other Date-parseable format
  const date = new Date(str);
  if (!Number.isNaN(date.getTime())) {
    return (date.getHours() * 60) + date.getMinutes();
  }

  return null;
}

function extractSunriseSunsetByDate(payload) {
  const map = {};
  if (!payload || typeof payload !== 'object') return map;

  // Shape: { sunriseSunsetByDate: { 'YYYY-MM-DD': { sunrise, sunset } } }
  const nested = payload.sunriseSunsetByDate;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    Object.entries(nested).forEach(([dateKey, value]) => {
      if (!value || typeof value !== 'object') return;
      const sunrise = parseTimeToMinutes(value.sunrise);
      const sunset = parseTimeToMinutes(value.sunset);
      if (sunrise !== null || sunset !== null) {
        map[dateKey] = { sunrise, sunset };
      }
    });
  }

  // Shape: { daily: [{ date|time, sunrise, sunset }] }
  if (Array.isArray(payload.daily)) {
    payload.daily.forEach(day => {
      if (!day || typeof day !== 'object') return;
      const dateRaw = day.date || day.time || day.datetime;
      if (!dateRaw) return;
      let dateKey;
      try {
        dateKey = new Date(dateRaw).toISOString().split('T')[0];
      } catch (e) {
        dateKey = String(dateRaw).split('T')[0];
      }
      const sunrise = parseTimeToMinutes(day.sunrise);
      const sunset = parseTimeToMinutes(day.sunset);
      if (sunrise !== null || sunset !== null) {
        map[dateKey] = { sunrise, sunset };
      }
    });
  }

  // Shape: { daily: { time: [...], sunrise: [...], sunset: [...] } }
  if (payload.daily && typeof payload.daily === 'object' && !Array.isArray(payload.daily)) {
    const dailyTimes = Array.isArray(payload.daily.time) ? payload.daily.time : [];
    const dailySunrise = Array.isArray(payload.daily.sunrise) ? payload.daily.sunrise : [];
    const dailySunset = Array.isArray(payload.daily.sunset) ? payload.daily.sunset : [];

    dailyTimes.forEach((dateRaw, idx) => {
      if (!dateRaw) return;
      const dateKey = String(dateRaw).split('T')[0];
      const sunrise = parseTimeToMinutes(dailySunrise[idx]);
      const sunset = parseTimeToMinutes(dailySunset[idx]);
      if (sunrise !== null || sunset !== null) {
        map[dateKey] = { sunrise, sunset };
      }
    });
  }

  // Shape: { sunrise: [...], sunset: [...], dates|time: [...] }
  if (Array.isArray(payload.sunrise) && Array.isArray(payload.sunset)) {
    const dateList = Array.isArray(payload.dates)
      ? payload.dates
      : (Array.isArray(payload.time) ? payload.time : []);
    payload.sunrise.forEach((sunriseVal, idx) => {
      const dateRaw = dateList[idx];
      if (!dateRaw) return;
      const dateKey = String(dateRaw).split('T')[0];
      const sunrise = parseTimeToMinutes(sunriseVal);
      const sunset = parseTimeToMinutes(payload.sunset[idx]);
      if (sunrise !== null || sunset !== null) {
        map[dateKey] = { sunrise, sunset };
      }
    });
  }

  return map;
}

function isNightAtHour(dateKey, hour) {
  const fallbackNightStart = 19;
  const fallbackDayStart = 7;
  const daySunTimes = sunriseSunsetByDate[dateKey];

  if (!daySunTimes) {
    return hour < fallbackDayStart || hour >= fallbackNightStart;
  }

  const sunrise = daySunTimes.sunrise;
  const sunset = daySunTimes.sunset;
  if (sunrise === null || sunrise === undefined || sunset === null || sunset === undefined) {
    return hour < fallbackDayStart || hour >= fallbackNightStart;
  }

  const minuteOfDay = hour * 60;
  return minuteOfDay < sunrise || minuteOfDay >= sunset;
}

// Example final map values:
// WEATHER_CODE_ICON_MAP[0] = 'clear-sky.png';
// WEATHER_CODE_ICON_MAP[1] = 'mainly-clear.png';
// WEATHER_CODE_ICON_MAP[95] = 'thunderstorm.png';

function getWeatherIconName(weatherCode, isNight = false) {
  const code = Number(weatherCode);
  const map = isNight ? WEATHER_CODE_ICON_MAP_NIGHT : WEATHER_CODE_ICON_MAP;
  if (Number.isInteger(code) && map[code]) {
    return map[code];
  }
  return 'slight-rain.png';
}

function getWeatherIconTooltip(weatherCode, isNight = false) {
  const code = Number(weatherCode);
  const map = isNight ? WEATHER_CODE_TOOLTIP_MAP_NIGHT : WEATHER_CODE_TOOLTIP_MAP;
  if (Number.isInteger(code) && map[code]) {
    return map[code];
  }
  return 'Weather icon';
}

// Convert wind direction (cardinal string or degrees) to numeric degrees
function getDirectionDegrees(dir) {
  if (dir === null || dir === undefined) return null;
  const n = parseFloat(String(dir));
  if (!isNaN(n)) return n;
  const s = String(dir).trim().toUpperCase();
  const map = {
    N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
    E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
    S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
    W: 270, WNW: 292.5, NW: 315, NNW: 337.5
  };
  return map[s] !== undefined ? map[s] : null;
}

function getDirectionLabel(dir) {
  const deg = getDirectionDegrees(dir);
  if (deg === null) return 'N/A';
  const labels = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(deg / 22.5) % 16;
  return labels[idx];
}

function createWindDirectionIcon(directionLabel, speedValue) {
  if (!directionLabel || directionLabel === 'N/A') {
    return createEl('span', { className: 'live-wind-value', text: 'N/A' });
  }

  const svgNs = 'http://www.w3.org/2000/svg';
  const xlinkNs = 'http://www.w3.org/1999/xlink';
  const symbolRef = `icons/windDirections.svg#wr-icon-wind-direction--${directionLabel}`;

  const icon = document.createElementNS(svgNs, 'svg');
  icon.setAttribute('class', 'wind-direction-icon');
  icon.setAttribute('viewBox', '0 0 32 32');
  icon.setAttribute('aria-label', `Wind direction ${directionLabel}`);
  icon.setAttribute('role', 'img');

  const useEl = document.createElementNS(svgNs, 'use');
  useEl.setAttribute('href', symbolRef);
  useEl.setAttributeNS(xlinkNs, 'xlink:href', symbolRef);

  icon.appendChild(useEl);

  if (speedValue !== null && speedValue !== undefined && speedValue !== 'N/A') {
    const speedText = document.createElementNS(svgNs, 'text');
    speedText.setAttribute('x', '16');
    speedText.setAttribute('y', '16.5');
    speedText.setAttribute('text-anchor', 'middle');
    speedText.setAttribute('dominant-baseline', 'middle');
    speedText.setAttribute('class', 'wind-direction-speed');
    speedText.textContent = String(speedValue);
    icon.appendChild(speedText);
  }

  return icon;
}

const clearElement = (element) => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

const createEl = (tag, options = {}) => {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.text !== undefined) el.textContent = options.text;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        el.setAttribute(key, String(value));
      }
    });
  }
  if (options.style) {
    Object.assign(el.style, options.style);
  }
  return el;
};

const appendTextWithLinks = (container, text) => {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const str = String(text || '');
  let lastIndex = 0;
  for (const match of str.matchAll(urlRegex)) {
    const url = match[0];
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      container.appendChild(document.createTextNode(str.slice(lastIndex, idx)));
    }
    const link = document.createElement('a');
    try {
      link.href = new URL(url).toString();
    } catch (e) {
      link.href = url;
    }
    link.textContent = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    container.appendChild(link);
    lastIndex = idx + url.length;
  }
  if (lastIndex < str.length) {
    container.appendChild(document.createTextNode(str.slice(lastIndex)));
  }
};

async function fetchSwellHeight() {
    const forecastContainer = document.getElementById('forecast-data');
    try {
    const WAVES_API_URL = API_BASE_URL + ENDPOINTS.waves;
    const response = await fetch(WAVES_API_URL);
        const data = await response.json();

        // Extract swell height data for today and next 7 days
        const swellHeights = data.daily.wave_height_max;
        const times = data.daily.time;

        // Group swell heights by day
        const dailySwell = {};
        times.forEach((time, index) => {
            const date = time.split('T')[0];
            if (!dailySwell[date]) {
                dailySwell[date] = [];
            }
            dailySwell[date].push(swellHeights[index]);
        });

        // Calculate average swell height per day
        const avgDailySwell = Object.entries(dailySwell).map(([date, heights]) => {
            const sum = heights.reduce((a, b) => a + b, 0);
            const avg = sum / heights.length;
            return { date, avg: avg.toFixed(2) };
        });

        // Display forecast for today and next 7 days — each day has Waves, Tides, Wind rows
        const fragment = document.createDocumentFragment();
        avgDailySwell.forEach((day, index) => {
            // Label is 'Today' for the first day, otherwise the weekday name with date in d-mmm format
            let label;
            const dateStr = new Date(day.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
            if (index === 0) {
                label = `Today ${dateStr}`;
            } else {
                // Convert YYYY-MM-DD to weekday name, e.g., 'Monday'
                const weekday = new Date(day.date).toLocaleDateString(undefined, { weekday: 'long' });
                label = `${weekday} ${dateStr}`;
            }

            const waves = `${day.avg} m`;
            const tides = 'Loading...'; // Will be populated by fetchTideData
            const wind = 'Loading...';  // Will be populated by fetchWeatherForecast

            const dayEl = createEl('div', { className: 'forecast-day', attrs: { 'data-date': day.date } });
            dayEl.appendChild(createEl('h3', { text: label }));

            const wavesRow = createEl('div', { className: 'forecast-row' });
            const wavesLabel = createEl('span', { className: 'label' });
            const wavesBtn = createEl('button', {
              className: 'info-btn',
              text: 'i',
              attrs: {
                type: 'button',
                'data-info': 'Waves: Maximum wave forecast for this day from marine-api.open-meteo.com.'
              }
            });
            wavesLabel.appendChild(wavesBtn);
            wavesLabel.appendChild(document.createTextNode(' '));
            wavesLabel.appendChild(createEl('strong', { text: 'Waves:' }));
            wavesRow.appendChild(wavesLabel);
            wavesRow.appendChild(createEl('span', { className: 'value', text: waves }));
            dayEl.appendChild(wavesRow);

            const tidesRow = createEl('div', { className: 'forecast-row tides-row' });
            const tidesLabel = createEl('span', { className: 'label' });
            const tidesBtn = createEl('button', {
              className: 'info-btn',
              text: 'i',
              attrs: {
                type: 'button',
                'data-info': 'Tidal info for Fidra from admiraltyapi.azure-api.net. HW=High Water, LW=Low Water'
              }
            });
            tidesLabel.appendChild(tidesBtn);
            tidesLabel.appendChild(document.createTextNode(' '));
            tidesLabel.appendChild(createEl('strong', { text: 'Tides:' }));
            const tidesSublabels = createEl('span', { className: 'tides-sublabels' });
            tidesSublabels.appendChild(createEl('span', { className: 'tides-spacer', text: 'HW', attrs: { 'aria-hidden': 'true' } }));
            tidesSublabels.appendChild(createEl('span', { className: 'tides-time', text: 'Time' }));
            tidesSublabels.appendChild(createEl('span', { className: 'tides-metres', text: 'metres' }));
            tidesLabel.appendChild(tidesSublabels);
            tidesRow.appendChild(tidesLabel);
            tidesRow.appendChild(createEl('span', { className: 'value', text: tides, attrs: { id: `tides-day-${index}` } }));
            dayEl.appendChild(tidesRow);

            const windRow = createEl('div', { className: 'forecast-row wind-row' });
            const windLabel = createEl('span', { className: 'label' });
            const windBtn = createEl('button', {
              className: 'info-btn',
              text: 'i',
              attrs: {
                type: 'button',
                'data-info': 'Weather: Hourly wind speed, direction, and rain probability forecast from api.open-meteo.com'
              }
            });
            windLabel.appendChild(windBtn);
            windLabel.appendChild(document.createTextNode(' '));
            windLabel.appendChild(createEl('strong', { text: 'Weather:' }));
            const weatherSublabels = createEl('span', { className: 'weather-sublabels' });
            weatherSublabels.appendChild(createEl('span', { className: 'weather-spacer', text: '00:00', attrs: { 'aria-hidden': 'true' } }));
            weatherSublabels.appendChild(createEl('span', { className: 'weather-mph', text: 'mph' }));
            weatherSublabels.appendChild(createEl('span', { className: 'weather-direction', text: 'Direction' }));
            weatherSublabels.appendChild(createEl('span', { className: 'weather-rain', text: 'Rain %' }));
            weatherSublabels.appendChild(createEl('span', { className: 'weather-temp', text: 'Temp °C' }));
            windLabel.appendChild(weatherSublabels);
            windRow.appendChild(windLabel);
            windRow.appendChild(createEl('span', { className: 'value', text: wind, attrs: { id: `wind-day-${index}` } }));
            dayEl.appendChild(windRow);

            fragment.appendChild(dayEl);
        });

        clearElement(forecastContainer);
        forecastContainer.appendChild(fragment);

        // Now that forecast days are rendered into the DOM, fetch tide data for those dates
        fetchTideData(Array.from(document.querySelectorAll('.forecast-day')).map(el => el.dataset.date).filter(Boolean));
    } catch (error) {
        clearElement(forecastContainer);
        forecastContainer.appendChild(createEl('p', { text: 'Error loading swell height data.' }));
        console.error('Fetch error:', error);
    }
}

async function fetchWindData() {
  const windContainer = document.getElementById('wind-data');
  try {
    const WIND_API_URL = API_BASE_URL + ENDPOINTS.livewind;
    console.debug('Using wind API:', WIND_API_URL);
    const response = await fetch(WIND_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    const sunTimesFromWind = extractSunriseSunsetByDate(data);
    if (Object.keys(sunTimesFromWind).length > 0) {
      sunriseSunsetByDate = {
        ...sunriseSunsetByDate,
        ...sunTimesFromWind
      };
    }
    console.debug('Sunrise/sunset map:', sunriseSunsetByDate);

    if (data.error) {
      clearElement(windContainer);
      windContainer.appendChild(createEl('p', { text: 'Error loading wind data.' }));
      return;
    }

    const units = data.units || 'knots';
    const speed = (data.windSpeed && !isNaN(parseFloat(data.windSpeed))) ? Math.round(parseFloat(data.windSpeed)) : (data.windSpeed || 'N/A');
    const direction = data.windDirection || data.wind_direction || data.windFrom || 'N/A';
    const windFrom = data.windFrom || 'N/A';
    const ts = data.latestTimestamp || data.timestamp || 'N/A';

    const intervalRows = ['5', '30', '60'];
    const stats = Array.isArray(data.meanMaxByInterval) ? data.meanMaxByInterval : [];
    const statsByInterval = new Map(stats.map(item => [String(item.intervalMinutes), item]));

    const buildCell = (interval, key) => {
      const row = statsByInterval.get(interval);
      if (!row || row[key] === undefined || row[key] === null || row[key] === '') return 'N/A';
      return String(row[key]);
    };

    const statsTable = createEl('table', { className: 'wind-stats-table', attrs: { 'aria-label': 'Wind speed stats' } });
    const thead = createEl('thead');
    const headRow = createEl('tr');
    headRow.appendChild(createEl('th', { text: units, attrs: { scope: 'col' } }));
    headRow.appendChild(createEl('th', { text: 'Min', attrs: { scope: 'col' } }));
    headRow.appendChild(createEl('th', { text: 'Mean', attrs: { scope: 'col' } }));
    headRow.appendChild(createEl('th', { text: 'Max', attrs: { scope: 'col' } }));
    thead.appendChild(headRow);
    statsTable.appendChild(thead);

    const tbody = createEl('tbody');
    intervalRows.forEach(interval => {
      const row = createEl('tr');
      row.appendChild(createEl('th', { text: `${interval} mins`, attrs: { scope: 'row' } }));
      row.appendChild(createEl('td', { text: buildCell(interval, 'min') }));
      row.appendChild(createEl('td', { text: buildCell(interval, 'mean') }));
      row.appendChild(createEl('td', { text: buildCell(interval, 'max') }));
      tbody.appendChild(row);
    });
    statsTable.appendChild(tbody);

    const layout = createEl('div', { className: 'live-wind-layout' });
    const lines = createEl('div', { className: 'live-wind-lines' });
    const addLine = (labelText, valueNodeOrText) => {
      const line = createEl('div', { className: 'live-wind-line' });
      line.appendChild(createEl('span', { className: 'label', text: labelText }));
      if (typeof valueNodeOrText === 'string') {
        line.appendChild(createEl('span', { className: 'live-wind-value', text: valueNodeOrText }));
      } else {
        const valueWrap = createEl('span', { className: 'live-wind-value live-wind-value--icon' });
        valueWrap.appendChild(valueNodeOrText);
        line.appendChild(valueWrap);
      }
      lines.appendChild(line);
    };
    addLine('Timestamp:', ts);
    addLine(`${units}:`, createWindDirectionIcon(getDirectionLabel(direction), speed));
    layout.appendChild(lines);
    layout.appendChild(statsTable);

    clearElement(windContainer);
    windContainer.appendChild(layout);
  } catch (error) {
    clearElement(windContainer);
    windContainer.appendChild(createEl('p', { text: 'Error loading wind data.' }));
    console.error('Fetch wind data error:', error);
  }
}

async function fetchWeatherForecast() {
  try {
    const WEATHER_API_URL = API_BASE_URL + ENDPOINTS.weatherforecast;
    console.debug('Using weather API:', WEATHER_API_URL);
    const response = await fetch(WEATHER_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.debug('Weather forecast data received:', data);

    const sunTimesFromForecast = extractSunriseSunsetByDate(data);
    if (Object.keys(sunTimesFromForecast).length > 0) {
      sunriseSunsetByDate = {
        ...sunriseSunsetByDate,
        ...sunTimesFromForecast
      };
      console.debug('Merged sunrise/sunset from forecast:', sunriseSunsetByDate);
    }

    if (data.error) {
      console.error('Weather API error:', data.error);
      return;
    }

    // Get today's date and forecast dates
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const forecastDates = Array.from(document.querySelectorAll('.forecast-day')).map(el => el.dataset.date).filter(Boolean);

    // Process data structure - handle both array format and open-meteo format
    // Format 1: { hourly: { time: [...], wind_speed_10m: [...], wind_direction_10m: [...], precipitation_probability: [...] } }
    // Format 2: { hourly: [...] } or { data: [...] } or { days: [...] }
    let dataByDate = {};
    
    if (data.hourly && data.hourly.time && Array.isArray(data.hourly.time)) {
      // Open-meteo style format with time array and parallel data arrays
      const times = data.hourly.time;
      const windSpeeds = data.hourly.wind_speed_10m || data.hourly.windSpeed || data.hourly.wind_speed || [];
      const windDirections = data.hourly.wind_direction_10m || data.hourly.windDirection || data.hourly.wind_direction || [];
      const rainProbs = data.hourly.precipitation_probability || data.hourly.precipitationProbability || [];
      const temps = data.hourly.temperature_2m || data.hourly.temperature || [];
      const weatherCodes = data.hourly.weather_code || data.hourly.weatherCode || [];
      
      times.forEach((time, idx) => {
        const dateStr = new Date(time).toISOString().split('T')[0];
        const hourNum = new Date(time).getHours();
        if (!dataByDate[dateStr]) dataByDate[dateStr] = {};
        dataByDate[dateStr][hourNum] = {
          windSpeed: windSpeeds[idx] || null,
          windDirection: windDirections[idx] || null,
          rainProbability: (rainProbs[idx] ?? null),
          temperature: (temps[idx] ?? null),
          weatherCode: (weatherCodes[idx] ?? null),
          timestamp: time
        };
      });
    } else {
      // Array format where each element is an hour object
      let hourlyData = [];
      
      if (Array.isArray(data.hourly)) {
        hourlyData = data.hourly;
      } else if (Array.isArray(data.data)) {
        hourlyData = data.data;
      } else if (data.days && Array.isArray(data.days)) {
        // Flatten nested hourly data from days
        data.days.forEach(day => {
          if (Array.isArray(day.hours)) {
            hourlyData = hourlyData.concat(day.hours);
          } else if (Array.isArray(day.hourly)) {
            hourlyData = hourlyData.concat(day.hourly);
          }
        });
      }

      // Group hourly data by date
      hourlyData.forEach(hour => {
        const timeStr = hour.timestamp || hour.time || hour.datetime;
        if (!timeStr) return;
        const dateStr = new Date(timeStr).toISOString().split('T')[0];
        const hourNum = new Date(timeStr).getHours();
        if (!dataByDate[dateStr]) dataByDate[dateStr] = {};
        dataByDate[dateStr][hourNum] = {
          windSpeed: hour.windSpeed || hour.wind_speed || hour.wind || null,
          windDirection: hour.windDirection || hour.wind_direction || hour.direction || null,
          rainProbability: (hour.precipitationProbability ?? hour.precipitation_probability ?? hour.rainProbability ?? null),
          weatherCode: (hour.weatherCode ?? hour.weather_code ?? null),
          timestamp: timeStr
        };
      });
    }

    // Populate wind rows for each forecast day
    forecastDates.slice(0, 7).forEach((date, dayIdx) => {
      const windEl = document.getElementById(`wind-day-${dayIdx}`);
      if (!windEl) return;
      
      const isToday = date === todayStr;
      let startHour, endHour;
      const LAST_HOUR = 23; // last column should be 19:00
      const LAST_HOUR_EXCLUSIVE = LAST_HOUR + 1; // loop upper bound

      if (isToday) {
        // Today: from next hour up to LAST_HOUR (19:00)
        const now = new Date();
        startHour = now.getHours() + 1; // Next hour
        if (startHour > LAST_HOUR) {
          // Nothing to show
          startHour = 0;
          endHour = 0;
        } else {
          endHour = LAST_HOUR_EXCLUSIVE;
        }
      } else {
        // Other days: from 07:00 to LAST_HOUR (19:00)
        startHour = 7;
        endHour = LAST_HOUR_EXCLUSIVE;
      }

      const dayData = dataByDate[date] || {};
      const hours = [];
      
      for (let h = startHour; h < endHour; h++) {
        hours.push(h);
      }

      // Only show if there's data for this day or it's within forecast range
      if (hours.length === 0) {
        windEl.textContent = 'N/A';
        return;
      }

      // Build weather grid as column-based layout so we can shade alternate columns
      const grid = createEl('div', {
        className: 'forecast-grid',
        style: {
          display: 'grid',
          gridTemplateColumns: `repeat(${hours.length}, 80px)`,
          gap: '0',
          fontSize: '0.85em'
        }
      });

      hours.forEach(h => {
        const hourData = dayData[h];
        const speed = hourData && hourData.windSpeed !== null && !isNaN(parseFloat(hourData.windSpeed)) ? Math.round(parseFloat(hourData.windSpeed)) : 'N/A';
        const direction = hourData && hourData.windDirection ? getDirectionLabel(hourData.windDirection) : 'N/A';
        const rainRaw = hourData ? hourData.rainProbability : null;
        const rainProb = (rainRaw !== null && rainRaw !== undefined && !isNaN(parseFloat(rainRaw)))
          ? Math.round(parseFloat(rainRaw))
          : 'N/A';
        const tempRaw = hourData ? hourData.temperature : null;
        const tempVal = (tempRaw !== null && tempRaw !== undefined && !isNaN(parseFloat(tempRaw)))
          ? Math.round(parseFloat(tempRaw))
          : 'N/A';
        const tempText = tempVal === 'N/A' ? 'N/A' : `${tempVal}°`;
        const weatherCode = hourData ? hourData.weatherCode : null;
        const isNight = isNightAtHour(date, h);
        const weatherIconName = getWeatherIconName(weatherCode, isNight);
        const weatherIconTooltip = getWeatherIconTooltip(weatherCode, isNight);
        const iconFolder = isNight ? 'night' : 'day';
        const hourLabel = `${String(h).padStart(2, '0')}:00`;

        //console.debug(`[Weather display] ${date} ${hourLabel} code=${weatherCode ?? 'N/A'} period=${iconFolder} icon=${weatherIconName}`);

        const col = createEl('div', {
          className: 'forecast-col',
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 6px'
          }
        });
        col.appendChild(createEl('div', {
          className: 'hour',
          text: hourLabel,
          style: { fontWeight: 'bold', paddingBottom: '6px' }
        }));
        col.appendChild(createEl('img', {
          className: 'weather-icon-image',
          attrs: {
            src: `icons/weather/${iconFolder}/${weatherIconName}`,
            alt: weatherIconTooltip,
            title: weatherIconTooltip,
            tabindex: '0',
            role: 'button',
            'aria-label': weatherIconTooltip,
            'data-tooltip': weatherIconTooltip,
            loading: 'lazy'
          },
          style: { width: '24px', height: '24px', objectFit: 'contain', marginBottom: '6px' }
        }));
        col.appendChild(createEl('div', { className: 'speed', text: speed, style: { padding: '4px 0' } }));
        col.appendChild(createEl('div', {
          className: 'direction',
          text: direction,
          style: { padding: '4px 0', fontSize: '0.85em', color: '#444' }
        }));
        col.appendChild(createEl('div', { className: 'rain', text: rainProb, style: { padding: '4px 0' } }));
        col.appendChild(createEl('div', { className: 'temp', text: tempText, style: { padding: '4px 0' } }));
        grid.appendChild(col);
      });

      clearElement(windEl);
      windEl.appendChild(grid);
    });

  } catch (error) {
    console.error('Fetch weather data error:', error);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await fetchSwellHeight();
  await fetchWindData();
  fetchWeatherForecast();

  let weatherPopup = null;
  let weatherPopupTarget = null;

  const removeWeatherPopup = () => {
    if (weatherPopup) {
      weatherPopup.remove();
      weatherPopup = null;
      weatherPopupTarget = null;
    }
  };

  const showWeatherPopup = (target, text) => {
    if (!target || !text) return;

    if (weatherPopup && weatherPopupTarget === target) {
      removeWeatherPopup();
      return;
    }

    removeWeatherPopup();
    weatherPopupTarget = target;
    weatherPopup = document.createElement('div');
    weatherPopup.className = 'weather-icon-popup';
    weatherPopup.textContent = text;
    document.body.appendChild(weatherPopup);

    const rect = target.getBoundingClientRect();
    weatherPopup.style.left = `${rect.left + window.scrollX}px`;
    weatherPopup.style.top = `${rect.bottom + window.scrollY + 8}px`;
  };

  const getWeatherIconTooltipTarget = (eventTarget) => eventTarget && eventTarget.closest('.weather-icon-image[data-tooltip]');

  document.addEventListener('click', (e) => {
    const icon = getWeatherIconTooltipTarget(e.target);
    if (icon) {
      e.preventDefault();
      showWeatherPopup(icon, icon.getAttribute('data-tooltip'));
      return;
    }

    if (weatherPopup && !weatherPopup.contains(e.target)) {
      removeWeatherPopup();
    }
  });

  document.addEventListener('focusin', (e) => {
    const icon = getWeatherIconTooltipTarget(e.target);
    if (!icon) return;
    showWeatherPopup(icon, icon.getAttribute('data-tooltip'));
  });

  document.addEventListener('focusout', (e) => {
    const icon = getWeatherIconTooltipTarget(e.target);
    if (!icon) return;
    setTimeout(() => {
      const active = document.activeElement;
      if (!active || !active.closest('.weather-icon-image[data-tooltip]')) {
        removeWeatherPopup();
      }
    }, 0);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      removeWeatherPopup();
    }
  });
  
  // Add event delegation for info buttons in the entire document
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.info-btn');
    if (!btn) return;
    const text = btn.dataset.info || 'Info';
    // Remove existing popup
    const prev = document.querySelector('.info-popup');
    if (prev) prev.remove();
    const popup = document.createElement('div');
    popup.className = 'info-popup';
    
    appendTextWithLinks(popup, text);
    
    document.body.appendChild(popup);
    const rect = btn.getBoundingClientRect();
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.top = `${rect.bottom + window.scrollY + 8}px`;
    // Remove popup when clicking elsewhere
    const onDocClick = (ev) => {
      if (!popup.contains(ev.target) && ev.target !== btn) {
        popup.remove();
        document.removeEventListener('click', onDocClick);
      }
    };
    // Delay adding doc click to avoid immediate removal from same click
    setTimeout(() => document.addEventListener('click', onDocClick), 0);
  });
});
// Fetch data on page load
// Note: `fetchSwellHeight` will call `fetchTideData` after rendering the forecast days.

async function fetchTideData(dates = null) {
  const TIDES_API_URL = API_BASE_URL + ENDPOINTS.tides;

  try {
    console.debug('Fetching tides from:', TIDES_API_URL);
    const response = await fetch(TIDES_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.debug('Tides API response:', data);

    // Normalize tide events into {time, type, height, unit}
    const events = [];
    const pushEvent = (time, type, height, unit) => {
      if (!time) return;
      events.push({ time, type: (type || '').toString(), height: (height !== undefined && height !== null) ? height : null, unit });
    };

    // Common possible shapes: { days: [...] } or flat array like { tides: [...] } or { events: [...] }
    if (Array.isArray(data.days)) {
      data.days.forEach(day => {
        const baseDate = day.date || (day.time && day.time.split('T')[0]);
        if (Array.isArray(day.tides)) {
          day.tides.forEach(t => pushEvent(t.time || (baseDate + 'T' + (t.hour || '00:00:00')), t.type || t.name || t.label, t.height || t.ht || t.value || null, t.unit || day.unit || data.unit));
        } else {
          ['highs', 'lows', 'high_tides', 'low_tides'].forEach(k => {
            if (Array.isArray(day[k])) {
              day[k].forEach(t => pushEvent(t.time || (baseDate + 'T' + (t.hour || '00:00:00')), k.toLowerCase().includes('high') ? 'High' : 'Low', t.height || t.h || t.value || null, t.unit || day.unit || data.unit));
            }
          });
        }
      });
    } else {
      const candidates = data.events || data.tides || data.tideEvents || data.items || (Array.isArray(data) ? data : null);
      if (Array.isArray(candidates)) {
        candidates.forEach(t => pushEvent(t.time || t.timestamp || t.datetime || t.DateTime, t.type || t.kind || t.label || t.EventType, t.height || t.value || t.ht || t.Height, t.unit || data.unit));
      }
    }

    // Group events by ISO date (YYYY-MM-DD)
    console.debug('Events collected:', events);
    const eventsByDate = {};
    events.forEach(e => {
      let dKey;
      try { dKey = new Date(e.time).toISOString().split('T')[0]; } catch (err) { dKey = (e.time || '').split('T')[0]; }
      if (!eventsByDate[dKey]) eventsByDate[dKey] = [];
      eventsByDate[dKey].push(e);
    });

    // If dates argument not provided, infer from DOM's forecast-day data-date attributes
    if (!dates) {
      dates = Array.from(document.querySelectorAll('.forecast-day')).map(el => el.dataset.date).filter(Boolean);
    }

    // Populate the first 7 days' tide cells
    dates.slice(0, 7).forEach((date, idx) => {
      const el = document.getElementById(`tides-day-${idx}`);
      if (!el) return;
      const dayEvents = (eventsByDate[date] || []).slice().sort((a, b) => new Date(a.time) - new Date(b.time));

      const parts = [];
      for (let i = 0; i < dayEvents.length && parts.length < 4; i++) {
        const ev = dayEvents[i];
        const timeStr = (function () {
          try { return new Date(ev.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ev.time || 'N/A'; }
        })();
        const heightStr = (ev.height !== null && ev.height !== undefined) ? `${parseFloat(ev.height).toFixed(2)}` : 'N/A';
        let typeLabel = ev.type || '';
        if (typeLabel === 'HighWater') typeLabel = 'HW';
        else if (typeLabel === 'LowWater') typeLabel = 'LW';
        else typeLabel = typeLabel.replace(/^[a-z]/, s => s.toUpperCase());
        parts.push({ type: typeLabel, time: timeStr, height: heightStr });
      }
      while (parts.length < 4) parts.push({ type: 'N/A', time: 'N/A', height: 'N/A' });
      
      const tideGrid = createEl('div', {
        className: 'tide-grid',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 80px)',
          gap: '0',
          fontSize: '0.9em'
        }
      });
      const tideValues = [
        parts[0].type, parts[1].type, parts[2].type, parts[3].type,
        parts[0].time, parts[1].time, parts[2].time, parts[3].time,
        parts[0].height, parts[1].height, parts[2].height, parts[3].height
      ];
      tideValues.forEach(value => tideGrid.appendChild(createEl('div', { text: value })));
      clearElement(el);
      el.appendChild(tideGrid);
    });
  } catch (error) {
    console.error('Fetch tide data error:', error);
    // If tide fetch fails, set all tide cells to 'N/A'
    document.querySelectorAll('[id^="tides-day-"]').forEach(el => { el.textContent = 'N/A'; });
  }
}