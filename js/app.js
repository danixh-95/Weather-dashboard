/**
 * Main Application Coordinator
 * Handles initialization, event bindings, geolocations, recent search histories, and suggestions.
 */

import * as Api from './api.js';
import * as Theme from './theme.js';
import { processDailyForecast, updateHourlyChart } from './forecast.js';
import * as UI from './ui.js';

// Global state
let currentForecastList = [];
const DEFAULT_CITY = 'New York';
const HISTORY_KEY = 'weather_dashboard_history';

// Popular cities list for autocomplete recommendations (avoiding API limits)
const POPULAR_CITIES = [
    { name: 'London', country: 'United Kingdom' },
    { name: 'New York', country: 'United States' },
    { name: 'Tokyo', country: 'Japan' },
    { name: 'Paris', country: 'France' },
    { name: 'Sydney', country: 'Australia' },
    { name: 'Dubai', country: 'United Arab Emirates' },
    { name: 'Cairo', country: 'Egypt' },
    { name: 'Moscow', country: 'Russia' },
    { name: 'Mumbai', country: 'India' },
    { name: 'Rio de Janeiro', country: 'Brazil' },
    { name: 'Toronto', country: 'Canada' },
    { name: 'Cape Town', country: 'South Africa' },
    { name: 'Singapore', country: 'Singapore' },
    { name: 'Berlin', country: 'Germany' },
    { name: 'Rome', country: 'Italy' },
    { name: 'Istanbul', country: 'Turkey' },
    { name: 'Chicago', country: 'United States' },
    { name: 'Los Angeles', country: 'United States' },
    { name: 'Hong Kong', country: 'Hong Kong' },
    { name: 'Seoul', country: 'South Korea' }
];

// =========================================================================
// ENTRY POINT / INITIALIZATION
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Theme
    Theme.initTheme();
    updateThemeToggleUI(Theme.getCurrentTheme());
    
    // 2. Setup Live clock
    startLiveClock();
    
    // 3. Render Search History
    renderRecentSearches();
    
    // 4. Setup Event Listeners
    setupEventListeners();
    
    // 5. Load Initial Data (Auto detect location or load default city)
    loadInitialWeather();
});

// =========================================================================
// EVENT LISTENERS BINDING
// =========================================================================

function setupEventListeners() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const geoBtn = document.getElementById('geo-btn');
    const themeBtn = document.getElementById('theme-btn');
    const suggestionsList = document.getElementById('suggestions-list');
    
    // Theme toggle button click
    themeBtn.addEventListener('click', () => {
        const newTheme = Theme.toggleTheme();
        updateThemeToggleUI(newTheme);
    });
    
    // Geolocation button click
    geoBtn.addEventListener('click', () => {
        detectUserLocation();
    });
    
    // City search form submit
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            performCitySearch(query);
            suggestionsList.style.display = 'none';
        }
    });
    
    // Suggestion Autocomplete typing trigger
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            suggestionsList.style.display = 'none';
            return;
        }
        
        // Filter autocomplete list
        const matches = POPULAR_CITIES.filter(city => 
            city.name.toLowerCase().startsWith(query)
        ).slice(0, 5); // Limit to top 5 results
        
        if (matches.length > 0) {
            suggestionsList.innerHTML = '';
            matches.forEach(city => {
                const li = document.createElement('li');
                li.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>${city.name} <span>${city.country}</span>`;
                li.addEventListener('click', () => {
                    searchInput.value = city.name;
                    performCitySearch(city.name);
                    suggestionsList.style.display = 'none';
                });
                suggestionsList.appendChild(li);
            });
            suggestionsList.style.display = 'block';
        } else {
            suggestionsList.style.display = 'none';
        }
    });
    
    // Close suggestions if clicked outside
    document.addEventListener('click', (e) => {
        if (!searchForm.contains(e.target)) {
            suggestionsList.style.display = 'none';
        }
    });
    
    // Navbar visual effects on page scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Keep Chart.js in sync when theme changes
    Theme.addThemeChangeListener((newTheme) => {
        const chartCanvas = document.getElementById('hourly-chart');
        if (currentForecastList.length > 0 && chartCanvas) {
            updateHourlyChart(chartCanvas, currentForecastList, newTheme);
        }
    });
}

// =========================================================================
// DATA FETCHING & COORDINATION
// =========================================================================

/**
 * Perform a full weather fetch pipeline by city name
 */
async function performCitySearch(city) {
    UI.toggleSkeletonLoading(true);
    
    try {
        const currentData = await Api.getCurrentWeather(city);
        await loadWeatherDetails(currentData);
        
        // Add to search history if not running in demo/fallback mode
        if (!Api.isDemoData) {
            saveToHistory(currentData.name);
        } else {
            UI.showToast('Using demo weather details (API key not active or offline)', 'warning');
        }
        
    } catch (error) {
        console.error('Search query failed:', error);
        UI.showToast(error.message || 'City not found. Please check spelling.', 'error');
    } finally {
        UI.toggleSkeletonLoading(false);
    }
}

/**
 * Perform a coordinates weather fetch pipeline (from geolocation)
 */
async function performCoordsSearch(lat, lon) {
    UI.toggleSkeletonLoading(true);
    
    try {
        const currentData = await Api.getWeatherByCoords(lat, lon);
        await loadWeatherDetails(currentData);
        
        if (Api.isDemoData) {
            UI.showToast('Using demo weather details (API key not active or offline)', 'warning');
        } else {
            UI.showToast('Weather updated for current location', 'info');
        }
    } catch (error) {
        console.error('Coords query failed:', error);
        UI.showToast('Failed to fetch weather for your location.', 'error');
        // Fallback to default city if location fails
        performCitySearch(DEFAULT_CITY);
    } finally {
        UI.toggleSkeletonLoading(false);
    }
}

/**
 * Triggers sub-component APIs (Forecast and Air Quality) using lat/lon coordinate references
 */
async function loadWeatherDetails(currentData) {
    const lat = currentData.coord.lat;
    const lon = currentData.coord.lon;
    
    // Trigger details async parallel loading
    const [aqiData, forecastData] = await Promise.all([
        Api.getAirQuality(lat, lon),
        Api.getForecast(lat, lon)
    ]);
    
    // 1. Current weather DOM updates
    UI.updateCurrentWeather(currentData);
    
    // 2. Air quality DOM updates
    UI.updateAirQuality(aqiData);
    
    // 3. Process 5-day forecast & render
    const dailyForecast = processDailyForecast(forecastData.list);
    UI.updateForecastUI(dailyForecast);
    
    // 4. Draw Chart.js hourly graph (next 24 hours)
    currentForecastList = forecastData.list;
    const chartCanvas = document.getElementById('hourly-chart');
    updateHourlyChart(chartCanvas, currentForecastList, Theme.getCurrentTheme());
    
    // Reset search input
    document.getElementById('search-input').value = '';
}

// =========================================================================
// GEOLOCATION DETECTION
// =========================================================================

function detectUserLocation() {
    if (!navigator.geolocation) {
        UI.showToast('Geolocation is not supported by your browser.', 'error');
        performCitySearch(DEFAULT_CITY);
        return;
    }
    
    UI.showToast('Detecting location...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            performCoordsSearch(latitude, longitude);
        },
        (error) => {
            let errorMsg = 'Location access denied.';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = 'Location permission denied by user.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMsg = 'Request to get location timed out.';
                    break;
            }
            UI.showToast(`${errorMsg} Loading default city (${DEFAULT_CITY}).`, 'warning');
            performCitySearch(DEFAULT_CITY);
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

/**
 * Initializes weather on app load. Prefers geolocation, falls back to default city
 */
function loadInitialWeather() {
    // If we have geolocation access permission already cached or check on load:
    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            if (result.state === 'granted') {
                detectUserLocation();
            } else {
                performCitySearch(DEFAULT_CITY);
            }
        });
    } else {
        // Fallback: search default city directly on load
        performCitySearch(DEFAULT_CITY);
    }
}

// =========================================================================
// CLOCK TICKER
// =========================================================================

function startLiveClock() {
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    
    const updateTime = () => {
        const now = new Date();
        
        // Format Time: e.g. "10:32 AM"
        timeElement.textContent = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
        
        // Format Date: e.g. "Saturday, May 23, 2026"
        dateElement.textContent = now.toLocaleDateString([], {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };
    
    updateTime();
    setInterval(updateTime, 1000); // Check every second
}

// =========================================================================
// RECENT SEARCHES HISTORY MANAGEMENT
// =========================================================================

function saveToHistory(cityName) {
    if (!cityName) return;
    
    let history = getHistory();
    
    // Remove if already exists (to bump to front)
    history = history.filter(item => item.toLowerCase() !== cityName.toLowerCase());
    
    // Add to front
    history.unshift(cityName);
    
    // Limit to 5 entries
    history = history.slice(0, 5);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderRecentSearches();
}

function getHistory() {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
}

function deleteHistoryItem(cityName) {
    let history = getHistory();
    history = history.filter(item => item !== cityName);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderRecentSearches();
}

function renderRecentSearches() {
    const container = document.getElementById('search-chips');
    const wrapper = document.getElementById('recent-searches-wrapper');
    if (!container || !wrapper) return;
    
    const history = getHistory();
    
    if (history.length === 0) {
        wrapper.style.display = 'none';
        return;
    }
    
    wrapper.style.display = 'block';
    container.innerHTML = '';
    
    history.forEach(city => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `
            <span>${city}</span>
            <button class="chip-close" title="Remove">&times;</button>
        `;
        
        // Chip text click triggers search
        chip.querySelector('span').addEventListener('click', () => {
            performCitySearch(city);
        });
        
        // Close button click deletes history entry
        chip.querySelector('.chip-close').addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering search
            deleteHistoryItem(city);
        });
        
        container.appendChild(chip);
    });
}

// =========================================================================
// THEME ICON TOGGLE HELPERS
// =========================================================================

function updateThemeToggleUI(theme) {
    const themeBtn = document.getElementById('theme-btn');
    if (!themeBtn) return;
    
    if (theme === 'light') {
        // Show moon icon for toggling back to dark mode
        themeBtn.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.8 3.5-8.9 8.2-9.8.5-.1 1 .2 1.2.7.2.5 0 1.1-.4 1.4-3.5 2.4-4.8 7.2-2.9 10.9 1.9 3.6 6.5 5.3 10.2 3.8.5-.2 1.1 0 1.4.4.3.4.3 1-.1 1.4-2.1 2-5 3.2-7.9 3.2z"/>
            </svg>
        `;
        themeBtn.title = 'Switch to Dark Mode';
    } else {
        // Show sun icon for toggling back to light mode
        themeBtn.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.01c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
            </svg>
        `;
        themeBtn.title = 'Switch to Light Mode';
    }
}
