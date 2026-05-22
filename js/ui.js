/**
 * UI Renderer Module
 * Handles DOM manipulation, SVG icon generation, dynamic weather backgrounds, and skeleton screens.
 */

import { isDemoData } from './api.js';

// =========================================================================
// VECTOR WEATHER ICONS GENERATION (Custom standalone SVGs with animations)
// =========================================================================

/**
 * Returns inline animated SVG weather icons based on OpenWeatherMap icon codes
 * @param {string} iconCode - OWM icon code (e.g. '01d', '09n')
 * @returns {string} SVG HTML string
 */
export function getWeatherIconSVG(iconCode) {
    const isNight = iconCode.endsWith('n');
    const baseCode = iconCode.slice(0, 2);
    
    // Core styles for SVG items
    const styles = `
        <style>
            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes float-slow { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-4px) translateX(2px); } }
            @keyframes pulse-sun { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.06); opacity: 0.9; } }
            @keyframes rain-drip { 0% { transform: translateY(-10px); opacity: 0; } 50% { opacity: 0.8; } 100% { transform: translateY(12px); opacity: 0; } }
            @keyframes snow-drift { 0% { transform: translateY(-10px) translateX(0px); opacity: 0; } 50% { opacity: 0.9; } 100% { transform: translateY(12px) translateX(4px); opacity: 0; } }
            @keyframes flash { 0%, 90%, 94%, 100% { opacity: 0; } 92%, 96% { opacity: 1; } }
            .sun-glow { transform-origin: 32px 32px; animation: spin-slow 20s linear infinite, pulse-sun 4s ease-in-out infinite; }
            .cloud-body { transform-origin: 32px 32px; animation: float-slow 6s ease-in-out infinite; }
            .cloud-back { transform-origin: 32px 32px; animation: float-slow 8s ease-in-out infinite; }
            .rain-drop-1 { animation: rain-drip 1.2s infinite linear; }
            .rain-drop-2 { animation: rain-drip 1.2s infinite linear 0.4s; }
            .rain-drop-3 { animation: rain-drip 1.2s infinite linear 0.8s; }
            .snow-flake-1 { animation: snow-drift 1.8s infinite linear; }
            .snow-flake-2 { animation: snow-drift 1.8s infinite linear 0.6s; }
            .snow-flake-3 { animation: snow-drift 1.8s infinite linear 1.2s; }
            .lightning { animation: flash 5s infinite; }
        </style>
    `;

    switch (baseCode) {
        case '01': // Clear Sky
            if (isNight) {
                return `
                    <svg viewBox="0 0 64 64" class="weather-main-icon">
                        ${styles}
                        <path d="M48,34 C48,44 38,48 30,48 C20,48 16,40 16,34 C16,24 24,18 30,16 C26,20 25,26 28,32 C31,38 37,39 42,38 C46,37 48,34 48,34 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5" class="cloud-body" />
                        <circle cx="48" cy="18" r="1.5" fill="#fff" />
                        <circle cx="52" cy="28" r="1" fill="#fff" />
                        <circle cx="20" cy="18" r="1" fill="#fff" />
                    </svg>
                `;
            } else {
                return `
                    <svg viewBox="0 0 64 64" class="weather-main-icon">
                        ${styles}
                        <g class="sun-glow">
                            <circle cx="32" cy="32" r="12" fill="#ffb900" filter="drop-shadow(0 0 8px rgba(255,185,0,0.6))" />
                            <path d="M32,8 L32,14 M32,50 L32,56 M8,32 L14,32 M50,32 L56,32 M15,15 L20,20 M44,44 L49,49 M15,49 L20,44 M44,15 L49,20" stroke="#ff8f00" stroke-width="3" stroke-linecap="round" />
                        </g>
                    </svg>
                `;
            }
            
        case '02': // Few Clouds
            if (isNight) {
                return `
                    <svg viewBox="0 0 64 64" class="weather-main-icon">
                        ${styles}
                        <path d="M38,26 C38,34 30,37 24,37 C16,37 13,31 13,26 C13,18 19,13 24,11 C21,14 20,19 22,24 C24,29 29,30 33,29 C36,28 38,26 38,26 Z" fill="#e2e8f0" class="cloud-back" />
                        <path d="M46,34 C46,29 41.5,25 36.5,25 C35.8,25 35.1,25.1 34.4,25.3 C32.4,21.7 28.5,19 24,19 C17.4,19 12,24.4 12,31 C12,31.7 12.1,32.3 12.2,33 C8.2,34.1 5,37.8 5,42 C5,46.9 9.1,51 14,51 L44,51 C48.9,51 53,46.9 53,42 C53,37.8 49.8,34.1 46,34 Z" fill="#94a3b8" stroke="#64748b" stroke-width="1" class="cloud-body" />
                    </svg>
                `;
            } else {
                return `
                    <svg viewBox="0 0 64 64" class="weather-main-icon">
                        ${styles}
                        <g class="sun-glow" style="transform: translate(-6px, -6px);">
                            <circle cx="32" cy="32" r="10" fill="#ffb900" />
                            <path d="M32,10 L32,14 M32,50 L32,54 M10,32 L14,32 M50,32 L54,32 M16,16 L20,20 M44,44 L48,48 M16,49 L20,45 M44,15 L48,19" stroke="#ff8f00" stroke-width="2.5" stroke-linecap="round" />
                        </g>
                        <path d="M46,36 C46,31 41.5,27 36.5,27 C35.8,27 35.1,27.1 34.4,27.3 C32.4,23.7 28.5,21 24,21 C17.4,21 12,26.4 12,33 C12,33.7 12.1,34.3 12.2,35 C8.2,36.1 5,39.8 5,44 C5,48.9 9.1,53 14,53 L44,53 C48.9,53 53,48.9 53,44 C53,39.8 49.8,36.1 46,36 Z" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" class="cloud-body" />
                    </svg>
                `;
            }
            
        case '03': // Scattered Clouds
        case '04': // Broken/Overcast Clouds
            return `
                <svg viewBox="0 0 64 64" class="weather-main-icon">
                    ${styles}
                    <path d="M26,18 C26,14.7 23.3,12 20,12 C15.6,12 12,15.6 12,20 C12,24.4 15.6,28 20,28 L28,28" fill="#cbd5e1" class="cloud-back" />
                    <path d="M46,32 C46,27 41.5,23 36.5,23 C35.8,23 35.1,23.1 34.4,23.3 C32.4,19.7 28.5,17 24,17 C17.4,17 12,22.4 12,29 C12,29.7 12.1,30.3 12.2,31 C8.2,32.1 5,35.8 5,40 C5,44.9 9.1,49 14,49 L44,49 C48.9,49 53,44.9 53,40 C53,35.8 49.8,32.1 46,32 Z" fill="#94a3b8" stroke="#64748b" stroke-width="1.5" class="cloud-body" />
                </svg>
            `;
            
        case '09': // Shower Rain
        case '10': // Rain
            return `
                <svg viewBox="0 0 64 64" class="weather-main-icon">
                    ${styles}
                    <g class="cloud-body">
                        <path d="M46,28 C46,23 41.5,19 36.5,19 C35.8,19 35.1,19.1 34.4,19.3 C32.4,15.7 28.5,13 24,13 C17.4,13 12,18.4 12,25 C12,25.7 12.1,26.3 12.2,27 C8.2,28.1 5,31.8 5,36 C5,40.9 9.1,45 14,45 L44,45 C48.9,45 53,40.9 53,36 C53,31.8 49.8,28.1 46,28 Z" fill="#94a3b8" stroke="#64748b" stroke-width="1.5" />
                    </g>
                    <g transform="translate(18, 48)">
                        <line x1="0" y1="0" x2="-2" y2="8" stroke="#00f2fe" stroke-width="2" stroke-linecap="round" class="rain-drop-1" />
                        <line x1="8" y1="-2" x2="6" y2="6" stroke="#00f2fe" stroke-width="2" stroke-linecap="round" class="rain-drop-2" />
                        <line x1="16" y1="0" x2="14" y2="8" stroke="#00f2fe" stroke-width="2" stroke-linecap="round" class="rain-drop-3" />
                    </g>
                </svg>
            `;
            
        case '11': // Thunderstorm
            return `
                <svg viewBox="0 0 64 64" class="weather-main-icon">
                    ${styles}
                    <g class="cloud-body">
                        <path d="M46,28 C46,23 41.5,19 36.5,19 C35.8,19 35.1,19.1 34.4,19.3 C32.4,15.7 28.5,13 24,13 C17.4,13 12,18.4 12,25 C12,25.7 12.1,26.3 12.2,27 C8.2,28.1 5,31.8 5,36 C5,40.9 9.1,45 14,45 L44,45 C48.9,45 53,40.9 53,36 C53,31.8 49.8,28.1 46,28 Z" fill="#475569" stroke="#334155" stroke-width="1.5" />
                    </g>
                    <path d="M26,45 L22,53 L28,53 L24,61 L34,49 L28,49 Z" fill="#ffd600" class="lightning" filter="drop-shadow(0 0 4px rgba(255,214,0,0.6))" />
                    <g transform="translate(14, 46)">
                        <line x1="0" y1="0" x2="-2" y2="6" stroke="#00f2fe" stroke-width="1.5" stroke-linecap="round" class="rain-drop-1" />
                        <line x1="16" y1="0" x2="14" y2="6" stroke="#00f2fe" stroke-width="1.5" stroke-linecap="round" class="rain-drop-3" />
                    </g>
                </svg>
            `;
            
        case '13': // Snow
            return `
                <svg viewBox="0 0 64 64" class="weather-main-icon">
                    ${styles}
                    <g class="cloud-body">
                        <path d="M46,28 C46,23 41.5,19 36.5,19 C35.8,19 35.1,19.1 34.4,19.3 C32.4,15.7 28.5,13 24,13 C17.4,13 12,18.4 12,25 C12,25.7 12.1,26.3 12.2,27 C8.2,28.1 5,31.8 5,36 C5,40.9 9.1,45 14,45 L44,45 C48.9,45 53,40.9 53,36 C53,31.8 49.8,28.1 46,28 Z" fill="#94a3b8" stroke="#64748b" stroke-width="1.5" />
                    </g>
                    <g transform="translate(18, 48)">
                        <circle cx="0" cy="0" r="2" fill="#fff" class="snow-flake-1" />
                        <circle cx="8" cy="-2" r="2" fill="#fff" class="snow-flake-2" />
                        <circle cx="16" cy="0" r="2" fill="#fff" class="snow-flake-3" />
                    </g>
                </svg>
            `;
            
        case '50': // Mist/Haze
            return `
                <svg viewBox="0 0 64 64" class="weather-main-icon">
                    ${styles}
                    <g fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" class="cloud-body">
                        <line x1="16" y1="22" x2="48" y2="22" />
                        <line x1="12" y1="30" x2="52" y2="30" />
                        <line x1="18" y1="38" x2="46" y2="38" />
                        <line x1="22" y1="46" x2="42" y2="46" />
                    </g>
                </svg>
            `;
            
        default:
            return `
                <svg viewBox="0 0 64 64" class="weather-main-icon">
                    <circle cx="32" cy="32" r="16" fill="#ffb900" />
                </svg>
            `;
    }
}

// =========================================================================
// BACKGROUND ANIMATION CONTROLLER (Efficient CSS Canvas simulations)
// =========================================================================

/**
 * Triggers responsive keyframe backgrounds based on current conditions
 * @param {string} weatherType - 'Clear', 'Clouds', 'Rain', 'Thunderstorm', 'Snow', 'Mist', etc.
 */
export function setWeatherBackground(weatherType) {
    const bgContainer = document.getElementById('weather-background');
    if (!bgContainer) return;
    
    // Clear current background
    bgContainer.innerHTML = '';
    
    switch (weatherType) {
        case 'Rain':
        case 'Drizzle':
            const rainWrap = document.createElement('div');
            rainWrap.className = 'rain-container';
            // Spawn rain particles
            for (let i = 0; i < 60; i++) {
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                drop.style.left = `${Math.random() * 100}%`;
                drop.style.top = `${Math.random() * -20}px`;
                drop.style.animationDelay = `${Math.random() * 2}s`;
                drop.style.animationDuration = `${0.5 + Math.random() * 0.7}s`;
                rainWrap.appendChild(drop);
            }
            bgContainer.appendChild(rainWrap);
            break;
            
        case 'Snow':
            const snowWrap = document.createElement('div');
            snowWrap.className = 'snow-container';
            // Spawn snow particles
            for (let i = 0; i < 40; i++) {
                const flake = document.createElement('div');
                flake.className = 'snow-flake';
                const size = 2 + Math.random() * 4;
                flake.style.width = `${size}px`;
                flake.style.height = `${size}px`;
                flake.style.left = `${Math.random() * 100}%`;
                flake.style.top = `${Math.random() * -20}px`;
                flake.style.animationDelay = `${Math.random() * 4}s`;
                flake.style.animationDuration = `${2.5 + Math.random() * 3}s`;
                snowWrap.appendChild(flake);
            }
            bgContainer.appendChild(snowWrap);
            break;
            
        case 'Clouds':
            const cloudsWrap = document.createElement('div');
            cloudsWrap.className = 'clouds-container';
            // Spawn fluffy clouds
            for (let i = 0; i < 4; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud-blob';
                const width = 200 + Math.random() * 200;
                cloud.style.width = `${width}px`;
                cloud.style.height = `${width * 0.6}px`;
                cloud.style.top = `${Math.random() * 60}%`;
                cloud.style.animationDelay = `${Math.random() * -20}s`;
                cloud.style.animationDuration = `${60 + Math.random() * 60}s`;
                cloudsWrap.appendChild(cloud);
            }
            bgContainer.appendChild(cloudsWrap);
            break;
            
        case 'Clear':
            const sunnyWrap = document.createElement('div');
            sunnyWrap.className = 'sunny-container';
            const sunGlow = document.createElement('div');
            sunGlow.className = 'sun-ray-glow';
            sunnyWrap.appendChild(sunGlow);
            bgContainer.appendChild(sunnyWrap);
            break;
            
        case 'Thunderstorm':
            // Overlay flashes
            const strikeOverlay = document.createElement('div');
            strikeOverlay.className = 'thunderstorm-overlay';
            bgContainer.appendChild(strikeOverlay);
            
            // Still rains in thunderstorms
            const stormRain = document.createElement('div');
            stormRain.className = 'rain-container';
            for (let i = 0; i < 70; i++) {
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                drop.style.left = `${Math.random() * 100}%`;
                drop.style.top = `${Math.random() * -20}px`;
                drop.style.animationDelay = `${Math.random() * 1.5}s`;
                drop.style.animationDuration = `${0.4 + Math.random() * 0.5}s`;
                stormRain.appendChild(drop);
            }
            bgContainer.appendChild(stormRain);
            break;
            
        case 'Mist':
        case 'Smoke':
        case 'Haze':
        case 'Dust':
        case 'Fog':
        case 'Sand':
        case 'Ash':
        case 'Squall':
        case 'Tornado':
            const mistWrap = document.createElement('div');
            mistWrap.className = 'clouds-container';
            // Dense slow clouds to mock mist
            for (let i = 0; i < 5; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud-blob';
                cloud.style.background = 'radial-gradient(circle, rgba(200, 200, 220, 0.4) 0%, rgba(200,200,220,0) 70%)';
                const width = 300 + Math.random() * 200;
                cloud.style.width = `${width}px`;
                cloud.style.height = `${width * 0.7}px`;
                cloud.style.top = `${20 + Math.random() * 60}%`;
                cloud.style.animationDelay = `${Math.random() * -30}s`;
                cloud.style.animationDuration = `${40 + Math.random() * 30}s`;
                mistWrap.appendChild(cloud);
            }
            bgContainer.appendChild(mistWrap);
            break;
            
        default:
            break;
    }
}

// =========================================================================
// LOADING STATE & TOAST SYSTEM
// =========================================================================

/**
 * Toggles skeleton classes on the page
 * @param {boolean} isLoading 
 */
export function toggleSkeletonLoading(isLoading) {
    const dashboard = document.querySelector('.dashboard-grid');
    if (isLoading) {
        dashboard.classList.add('loading');
    } else {
        dashboard.classList.remove('loading');
    }
}

/**
 * Renders a brief notification toast in the bottom-right corner
 * @param {string} message 
 * @param {'error' | 'warning' | 'info'} type 
 */
export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    // Prevent duplicate messages from stacking
    const existingToasts = container.querySelectorAll('.toast');
    for (const t of existingToasts) {
        const contentEl = t.querySelector('.toast-content');
        if (contentEl && contentEl.textContent === message) {
            return;
        }
    }
    
    // Limit maximum active toasts to prevent screen crowding
    if (existingToasts.length >= 3) {
        const oldest = existingToasts[0];
        oldest.classList.remove('show');
        setTimeout(() => oldest.remove(), 400);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast`;
    
    // Choose theme colors for status
    let statusColor = '#00f2fe';
    let icon = `
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
    `;
    
    if (type === 'error') {
        statusColor = '#ef4444';
        icon = `
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        `;
    } else if (type === 'warning') {
        statusColor = '#f59e0b';
        icon = `
            <svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
        `;
    }
    
    toast.style.setProperty('--status-color', statusColor);
    toast.innerHTML = `
        ${icon}
        <div class="toast-content">${message}</div>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 50);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// =========================================================================
// RENDER WEATHER CONTENT
// =========================================================================

/**
 * Calculates UV index dynamically based on Lat, cloud cover, and midday coordinates
 */
function estimateUVIndex(lat, cloudsPercent, sunrise, sunset, currentDt) {
    // If it's night, UV Index is 0
    if (currentDt < sunrise || currentDt > sunset) {
        return { val: 0, desc: 'None' };
    }
    
    // Peak hours (11 AM to 3 PM)
    const midday = (sunrise + sunset) / 2;
    const hoursFromMidday = Math.abs(currentDt - midday) / 3600;
    
    // UV decreases with distance from equator (lat = 0 has highest UV)
    const latFactor = Math.cos((lat * Math.PI) / 180); // 1 at equator, 0 at poles
    
    // Max UV at midday near equator
    let baseUV = 12 * latFactor;
    
    // Time of day drop off (using exponential decay from midday)
    const timeFactor = Math.max(0, 1 - (hoursFromMidday / 6));
    baseUV = baseUV * timeFactor;
    
    // Cloud cover blocks UV
    const cloudFactor = 1 - (cloudsPercent / 100) * 0.7; // Cloud blocks up to 70% of UV
    
    const uvVal = Math.max(0, parseFloat((baseUV * cloudFactor).toFixed(1)));
    
    let desc = 'Low';
    if (uvVal >= 3 && uvVal < 6) desc = 'Moderate';
    else if (uvVal >= 6 && uvVal < 8) desc = 'High';
    else if (uvVal >= 8 && uvVal < 11) desc = 'Very High';
    else if (uvVal >= 11) desc = 'Extreme';
    
    return { val: uvVal, desc: desc };
}

/**
 * Updates all current weather fields in the DOM
 */
export function updateCurrentWeather(data) {
    // 1. Text Details
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('country-code').textContent = `, ${data.sys.country}`;
    document.getElementById('main-temp').innerHTML = `${Math.round(data.main.temp)}<span class="temp-unit">°</span>`;
    document.getElementById('weather-desc').textContent = data.weather[0].description;
    
    document.getElementById('val-humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('val-wind-speed').textContent = `${data.wind.speed} m/s`;
    document.getElementById('val-feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('val-pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('val-visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    
    // Rotate wind arrow according to wind degrees
    const windArrow = document.getElementById('wind-arrow');
    if (windArrow && data.wind.deg !== undefined) {
        windArrow.style.transform = `rotate(${data.wind.deg}deg)`;
    }
    
    // 2. Sunrise / Sunset
    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    document.getElementById('val-sunrise').textContent = formatTime(data.sys.sunrise);
    document.getElementById('val-sunset').textContent = formatTime(data.sys.sunset);
    
    // 3. UV Index Estimation
    const uvInfo = estimateUVIndex(
        data.coord.lat, 
        data.clouds ? data.clouds.all : 20, 
        data.sys.sunrise, 
        data.sys.sunset, 
        data.dt
    );
    document.getElementById('val-uv-index').textContent = uvInfo.val;
    document.getElementById('val-uv-desc').textContent = uvInfo.desc;
    
    // 4. Custom Icon SVG
    const iconContainer = document.getElementById('weather-icon-container');
    if (iconContainer) {
        iconContainer.innerHTML = getWeatherIconSVG(data.weather[0].icon);
    }
    
    // 5. Dynamic Ambient Background
    setWeatherBackground(data.weather[0].main);
    
    // Show/Hide Offline Demo notification
    const badge = document.getElementById('demo-badge');
    if (badge) {
        if (isDemoData) {
            badge.classList.add('visible');
        } else {
            badge.classList.remove('visible');
        }
    }
}

/**
 * Updates Air Quality Card
 */
export function updateAirQuality(aqiData) {
    if (!aqiData || !aqiData.list || !aqiData.list[0]) return;
    
    const components = aqiData.list[0].components;
    const aqi = aqiData.list[0].main.aqi; // 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
    
    // Update elements
    document.getElementById('val-pm25').textContent = components.pm2_5.toFixed(1);
    document.getElementById('val-pm10').textContent = components.pm10.toFixed(1);
    document.getElementById('val-co').textContent = Math.round(components.co);
    document.getElementById('val-no2').textContent = components.no2.toFixed(1);
    document.getElementById('val-o3').textContent = components.o3.toFixed(1);
    
    document.getElementById('aqi-num').textContent = aqi;
    
    // Match colors & titles based on AQI standards
    const aqiCircle = document.getElementById('aqi-circle');
    const aqiStatus = document.getElementById('aqi-status');
    
    let aqiText = 'Good';
    let colorVar = 'var(--status-good)';
    let deg = 72; // Out of 360 (1/5)
    
    switch (aqi) {
        case 1:
            aqiText = 'Good';
            colorVar = 'var(--status-good)';
            deg = 72;
            break;
        case 2:
            aqiText = 'Fair';
            colorVar = 'var(--status-fair)';
            deg = 144;
            break;
        case 3:
            aqiText = 'Moderate';
            colorVar = 'var(--status-fair)';
            deg = 216;
            break;
        case 4:
            aqiText = 'Poor';
            colorVar = 'var(--status-poor)';
            deg = 288;
            break;
        case 5:
            aqiText = 'Very Poor';
            colorVar = 'var(--status-poor)';
            deg = 360;
            break;
    }
    
    aqiStatus.textContent = aqiText;
    aqiStatus.style.color = colorVar;
    
    // Set conic-gradient circle rotation representing value
    aqiCircle.style.background = `conic-gradient(${colorVar} 0deg, ${colorVar} ${deg}deg, rgba(255, 255, 255, 0.05) ${deg}deg, rgba(255, 255, 255, 0.05) 360deg)`;
}

/**
 * Updates 5-day forecast UI cards
 * @param {Array<Object>} days 
 */
export function updateForecastUI(days) {
    const container = document.getElementById('forecast-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    days.forEach((day, index) => {
        const row = document.createElement('div');
        row.className = `forecast-row fade-in delay-${index + 1}`;
        
        row.innerHTML = `
            <span class="forecast-day">${day.day}</span>
            <div class="forecast-condition-wrapper">
                <div class="forecast-icon">${getWeatherIconSVG(day.icon)}</div>
                <span class="forecast-desc">${day.description}</span>
            </div>
            <div class="forecast-temps">
                <span class="forecast-temp-max">${day.tempMax}°</span>
                <span class="forecast-temp-min">${day.tempMin}°</span>
            </div>
        `;
        
        container.appendChild(row);
    });
}
