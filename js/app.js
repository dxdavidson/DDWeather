// Placeholder API URL - replace with actual swell height forecast API
const LATITUDE = 51.3; // Example: North Berwick latitude
const LONGITUDE = -2.7; // Example: North Berwick longitude

// Wind API selection: default is 'railway'.
// Switch to local proxy by adding ?wind=local to the page URL or by setting window.WIND_API_ENV = 'local'.
const WIND_API_ENV = (new URLSearchParams(window.location.search).get('wind')) || (window.WIND_API_ENV) || 'railway';
const WIND_API_URL = WIND_API_ENV === 'local' ? 'http://localhost:3000/api/wind' : 'https://ddlivenbwind-production.up.railway.app/api/wind';

async function fetchSwellHeight() {
    const forecastContainer = document.getElementById('forecast-data');
    try {
        //const response = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${LATITUDE}&longitude=${LONGITUDE}&hourly=swell_height&forecast_days=7`);
        //https://marine-api.open-meteo.com/v1/marine?latitude=56.06&longitude=-2.7&daily=wave_height_max&timezone=Europe%2FLondon
        const response = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=56.06&longitude=-2.7&daily=wave_height_max&timezone=Europe%2FLondon`);
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
        let html = '';
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
            const wind = 'N/A';  // Placeholder until wind forecast per day is added

            html += `
            <div class="forecast-day" data-date="${day.date}">
                <h3>${label}</h3>
                <div class="forecast-row"><span class="label"><button type="button" class="info-btn" data-info="Waves: Maximum wave forecast for this day from marine-api.open-meteo.com.">i</button> <strong>Waves:</strong></span> <span class="value">${waves}</span></div>
                <div class="forecast-row tides-row"><span class="label"><button type="button" class="info-btn" data-info="Tidal info for Fidra from admiraltyapi.azure-api.net. HW=High Water, LW=Low Water">i</button> <strong>Tides:</strong></span> <span class="value" id="tides-day-${index}">${tides}</span></div>
                <div class="forecast-row"><span class="label"><button type="button" class="info-btn" data-info="Wind: Placeholder wind info (speed, direction).">i</button> <strong>Wind:</strong></span> <span class="value">${wind}</span></div>
            </div>
            `;
        });

        forecastContainer.innerHTML = html; 

        // Now that forecast days are rendered into the DOM, fetch tide data for those dates
        fetchTideData(Array.from(document.querySelectorAll('.forecast-day')).map(el => el.dataset.date).filter(Boolean));
    } catch (error) {
        forecastContainer.innerHTML = '<p>Error loading swell height data.</p>';
        console.error('Fetch error:', error);
    }
}

async function fetchWindData() {
  const windContainer = document.getElementById('wind-data');
  try {
    console.debug('Using wind API:', WIND_API_URL);
    const response = await fetch(WIND_API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (data.error) {
      windContainer.innerHTML = '<p>Error loading wind data.</p>';
      return;
    }

    const speed = (data.windSpeed && !isNaN(parseFloat(data.windSpeed))) ? parseFloat(data.windSpeed).toFixed(1) : (data.windSpeed || 'N/A');
    const direction = data.windDirection || 'N/A';
    const windFrom = data.windFrom || 'N/A';
    const ts = data.latestTimestamp || 'N/A';
    const speedDisplay = (speed === 'N/A') ? 'N/A' : `${speed} knots`;

    windContainer.innerHTML = `
      <p><strong>Timestamp:</strong> ${ts}</p>
      <p><strong>Wind Speed:</strong> ${speedDisplay}</p>
      <p><strong>Wind Direction:</strong> ${direction} (${windFrom})</p>
    `;
  } catch (error) {
    windContainer.innerHTML = '<p>Error loading wind data.</p>';
    console.error('Fetch wind data error:', error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  fetchSwellHeight();
  fetchWindData();
  
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
    
    // Check if text contains a URL and make it clickable
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(text)) {
      popup.innerHTML = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    } else {
      popup.textContent = text;
    }
    
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
  // Derive tides endpoint from WIND_API_URL by replacing the last /api/wind path with /api/tides
  const TIDES_API_URL = (() => {
    try {
      const u = new URL(WIND_API_URL);
      u.pathname = u.pathname.replace(/\/api\/wind$/, '/api/tides');
      return u.toString();
    } catch (e) {
      return WIND_API_URL.replace('/api/wind', '/api/tides');
    }
  })();

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
        const heightStr = (ev.height !== null && ev.height !== undefined) ? `${parseFloat(ev.height).toFixed(2)} m` : 'N/A';
        let typeLabel = ev.type || '';
        if (typeLabel === 'HighWater') typeLabel = 'HW';
        else if (typeLabel === 'LowWater') typeLabel = 'LW';
        else typeLabel = typeLabel.replace(/^[a-z]/, s => s.toUpperCase());
        parts.push({ type: typeLabel, time: timeStr, height: heightStr });
      }
      while (parts.length < 4) parts.push({ type: 'N/A', time: 'N/A', height: 'N/A' });
      
      const tideHtml = `
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 0.9em;">
          <div>${parts[0].type}</div>
          <div>${parts[1].type}</div>
          <div>${parts[2].type}</div>
          <div>${parts[3].type}</div>
          <div>${parts[0].time}</div>
          <div>${parts[1].time}</div>
          <div>${parts[2].time}</div>
          <div>${parts[3].time}</div>
          <div>${parts[0].height}</div>
          <div>${parts[1].height}</div>
          <div>${parts[2].height}</div>
          <div>${parts[3].height}</div>
        </div>
      `;
      el.innerHTML = tideHtml;
    });
  } catch (error) {
    console.error('Fetch tide data error:', error);
    // If tide fetch fails, set all tide cells to 'N/A'
    document.querySelectorAll('[id^="tides-day-"]').forEach(el => { el.textContent = 'N/A'; });
  }
}