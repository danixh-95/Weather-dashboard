/**
 * Theme Manager Module
 * Manages Dark and Light themes, syncing preferences to localStorage and notifying listener callbacks.
 */

const STORAGE_KEY = 'weather_dashboard_theme';
let currentTheme = 'dark'; // Default theme
const listeners = [];

/**
 * Initializes the theme from localStorage or system preference.
 */
export function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    
    if (savedTheme) {
        currentTheme = savedTheme;
    } else {
        // Detect system preferred color scheme
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        currentTheme = prefersDark ? 'dark' : 'light';
    }
    
    setTheme(currentTheme);
}

/**
 * Sets the active theme
 * @param {'dark' | 'light'} theme 
 */
export function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    
    // Set class on html or body element
    if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
    } else {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
    }
    
    // Notify all registered listeners
    listeners.forEach(callback => {
        try {
            callback(theme);
        } catch (error) {
            console.error('Error executing theme listener:', error);
        }
    });
}

/**
 * Toggles between dark and light themes
 * @returns {'dark' | 'light'} The new theme
 */
export function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    return newTheme;
}

/**
 * Gets the current active theme
 * @returns {'dark' | 'light'}
 */
export function getCurrentTheme() {
    return currentTheme;
}

/**
 * Registers a callback function to run when the theme changes (e.g. for Chart.js repaint)
 * @param {Function} callback 
 */
export function addThemeChangeListener(callback) {
    if (typeof callback === 'function') {
        listeners.push(callback);
    }
}
