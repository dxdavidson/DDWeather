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

        // Display swell height for today and next 7 days
        let html = '';
        avgDailySwell.forEach((day, index) => {
            if (index === 0) {
                html += `<p><strong>Today (${day.date}):</strong> ${day.avg} m</p>`;
            } else {
                html += `<p><strong>Day ${index} (${day.date}):</strong> ${day.avg} m</p>`;
            }
        });

        forecastContainer.innerHTML = html;
    } catch (error) {
        forecastContainer.innerHTML = '<p>Error loading swell height data.</p>';
        console.error('Fetch error:', error);
    }
}

async function fetchWindData() {
  const windContainer = document.getElementById('wind-data');
  try {
    const response = await fetch('http://localhost:3000/api/wind');
    const data = await response.json();

    if (data.error) {
      windContainer.innerHTML = '<p>Error loading wind data.</p>';
      return;
    }

    windContainer.innerHTML = `
      <p><strong>Timestamp:</strong> ${data.latestTimestamp || 'N/A'}</p>
      <p><strong>Wind Speed:</strong> ${data.windSpeed || 'N/A'}</p>
      <p><strong>Wind Direction:</strong> ${data.windDirection || 'N/A'} (${data.windFrom || 'N/A'})</p>
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