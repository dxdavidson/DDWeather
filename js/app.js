// Placeholder API URL - replace with actual swell height forecast API
const LATITUDE = 51.3; // Example: North Berwick latitude
const LONGITUDE = -2.7; // Example: North Berwick longitude

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
            // Label is 'Today' for the first day, otherwise the weekday name (no date shown)
            let label;
            if (index === 0) {
                label = 'Today';
            } else {
                // Convert YYYY-MM-DD to weekday name, e.g., 'Monday'
                const weekday = new Date(day.date).toLocaleDateString(undefined, { weekday: 'long' });
                label = weekday;
            }

            const waves = `${day.avg} m`;
            const tides = 'N/A'; // Placeholder until tidal data is added
            const wind = 'N/A';  // Placeholder until wind forecast per day is added

            html += `
            <div class="forecast-day">
                <h3>${label}</h3>
                <div class="forecast-row"><span class="label"><button type="button" class="info-btn" data-info="Waves: Maximum wave forecast for this day by marine-api.open-meteo.com.">i</button> <strong>Waves:</strong></span> <span class="value">${waves}</span></div>
                <div class="forecast-row"><span class="label"><button type="button" class="info-btn" data-info="Tides: Placeholder tide info (times & heights).">i</button> <strong>Tides:</strong></span> <span class="value">${tides}</span></div>
                <div class="forecast-row"><span class="label"><button type="button" class="info-btn" data-info="Wind: Placeholder wind info (speed, direction).">i</button> <strong>Wind:</strong></span> <span class="value">${wind}</span></div>
            </div>
            `;
        });

        forecastContainer.innerHTML = html;

        // Attach simple event delegation for info buttons in forecast rows
        forecastContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.info-btn');
            if (!btn) return;
            const text = btn.dataset.info || 'Info';
            // Remove existing popup
            const prev = document.querySelector('.info-popup');
            if (prev) prev.remove();
            const popup = document.createElement('div');
            popup.className = 'info-popup';
            popup.textContent = text;
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
    } catch (error) {
        forecastContainer.innerHTML = '<p>Error loading swell height data.</p>';
        console.error('Fetch error:', error);
    }
}

async function fetchWindData() {
  const windContainer = document.getElementById('wind-data');
  try {
    const response = await fetch('https://ddlivenbwind-production.up.railway.app/api/wind');
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
});
// Fetch data on page load
window.addEventListener('DOMContentLoaded', fetchSwellHeight);