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

    if (data.error) {
      clearElement(windContainer);
      windContainer.appendChild(createEl('p', { text: 'Error loading wind data.' }));
      return;
    }

    const speed = (data.windSpeed && !isNaN(parseFloat(data.windSpeed))) ? Math.round(parseFloat(data.windSpeed)) : (data.windSpeed || 'N/A');
    const direction = data.windDirection || data.wind_direction || 'N/A';
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
    headRow.appendChild(createEl('th', { text: 'Knots', attrs: { scope: 'col' } }));
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
    const addLine = (labelText, valueText) => {
      const line = createEl('div', { className: 'live-wind-line' });
      line.appendChild(createEl('span', { className: 'label', text: labelText }));
      line.appendChild(createEl('span', { className: 'live-wind-value', text: valueText }));
      lines.appendChild(line);
    };
    addLine('Timestamp:', ts);
    addLine('Wind:', speed === 'N/A' ? 'N/A' : `${speed} knots`);
    addLine('Direction:', `${direction} (${windFrom})`);
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
      
      times.forEach((time, idx) => {
        const dateStr = new Date(time).toISOString().split('T')[0];
        const hourNum = new Date(time).getHours();
        if (!dataByDate[dateStr]) dataByDate[dateStr] = {};
        dataByDate[dateStr][hourNum] = {
          windSpeed: windSpeeds[idx] || null,
          windDirection: windDirections[idx] || null,
          rainProbability: (rainProbs[idx] ?? null),
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
          text: `${String(h).padStart(2, '0')}:00`,
          style: { fontWeight: 'bold', paddingBottom: '6px' }
        }));
        col.appendChild(createEl('div', { className: 'speed', text: speed, style: { padding: '4px 0' } }));
        col.appendChild(createEl('div', {
          className: 'direction',
          text: direction,
          style: { padding: '4px 0', marginTop: '6px', fontSize: '0.85em', color: '#444' }
        }));
        col.appendChild(createEl('div', { className: 'rain', text: rainProb, style: { padding: '4px 0' } }));
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
  fetchWindData();
  fetchWeatherForecast();
  
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