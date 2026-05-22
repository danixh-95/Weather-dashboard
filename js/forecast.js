/**
 * Forecast Processing and Chart.js Manager Module
 * Extracts hourly details, computes daily aggregations, and handles the interactive forecast chart.
 */

let forecastChart = null;

/**
 * Groups 3-hourly forecast items into daily summaries
 * @param {Array} list - Array of 40 forecast intervals
 * @returns {Array<Object>} Array of daily forecast summaries (5 days)
 */
export function processDailyForecast(list) {
    const dailyData = {};
    
    list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateStr = date.toDateString(); // e.g. "Sat May 23 2026"
        
        if (!dailyData[dateStr]) {
            dailyData[dateStr] = {
                dt: item.dt,
                temps: [],
                weatherStates: [],
                items: []
            };
        }
        
        dailyData[dateStr].temps.push(item.main.temp);
        dailyData[dateStr].weatherStates.push(item.weather[0]);
        dailyData[dateStr].items.push(item);
    });
    
    const days = Object.keys(dailyData).map(dateStr => {
        const dayInfo = dailyData[dateStr];
        const dateObj = new Date(dayInfo.dt * 1000);
        
        // Find min and max temp
        const minTemp = Math.min(...dayInfo.temps);
        const maxTemp = Math.max(...dayInfo.temps);
        
        // Find dominant weather description (or select midday weather if available)
        // Midday (around 12:00 PM - 3:00 PM) is usually the best representation of daytime weather.
        let dominantWeather = dayInfo.weatherStates[0];
        const middayItem = dayInfo.items.find(item => {
            const hour = new Date(item.dt * 1000).getHours();
            return hour >= 12 && hour <= 15;
        });
        
        if (middayItem) {
            dominantWeather = middayItem.weather[0];
        } else if (dayInfo.weatherStates.length > 0) {
            // Fallback: Pick the most common condition
            const counts = {};
            dayInfo.weatherStates.forEach(w => {
                counts[w.id] = (counts[w.id] || 0) + 1;
            });
            let maxCount = 0;
            let bestWeather = dayInfo.weatherStates[0];
            dayInfo.weatherStates.forEach(w => {
                if (counts[w.id] > maxCount) {
                    maxCount = counts[w.id];
                    bestWeather = w;
                }
            });
            dominantWeather = bestWeather;
        }
        
        // Formulate day name
        const today = new Date();
        let dayName = '';
        if (dateObj.toDateString() === today.toDateString()) {
            dayName = 'Today';
        } else {
            const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            dayName = weekdays[dateObj.getDay()];
        }
        
        return {
            day: dayName,
            dateStr: dateStr,
            tempMin: Math.round(minTemp),
            tempMax: Math.round(maxTemp),
            condition: dominantWeather.main,
            description: dominantWeather.description,
            icon: dominantWeather.icon,
            dt: dayInfo.dt
        };
    });
    
    // OpenWeatherMap 5-day forecast can span 5 or 6 calendar days depending on start time.
    // Return maximum of 5 days starting from today.
    return days.slice(0, 5);
}

/**
 * Initializes or updates the Chart.js instance for the hourly forecast
 * @param {HTMLCanvasElement} canvas - The canvas element to draw on
 * @param {Array} hourlyList - Array of forecast items for the next 24h (usually 8 items)
 * @param {'dark' | 'light'} currentTheme - The current theme of the app
 */
export function updateHourlyChart(canvas, hourlyList, currentTheme) {
    if (!canvas) return;
    
    // Slice first 8 items (representing 24 hours of data in 3-hour increments)
    const next24Hours = hourlyList.slice(0, 8);
    
    const labels = next24Hours.map(item => {
        const date = new Date(item.dt * 1000);
        let hours = date.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return `${hours} ${ampm}`;
    });
    
    const temperatures = next24Hours.map(item => Math.round(item.main.temp));
    const rainProbabilities = next24Hours.map(item => Math.round(item.pop * 100)); // pop is 0 to 1
    
    // Chart Color Themes configuration
    const isDark = currentTheme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)';
    
    const tempLineColor = isDark ? '#00f2fe' : '#0284c7';
    const tempPointColor = isDark ? '#4facfe' : '#4f46e5';
    const rainBarColor = isDark ? 'rgba(79, 172, 254, 0.25)' : 'rgba(2, 132, 199, 0.25)';
    const rainBarBorderColor = isDark ? 'rgba(79, 172, 254, 0.6)' : 'rgba(2, 132, 199, 0.6)';

    // Destroy existing chart to prevent canvas reuse errors
    if (forecastChart) {
        forecastChart.destroy();
    }
    
    // Register Chart.js
    const ctx = canvas.getContext('2d');
    forecastChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    type: 'line',
                    data: temperatures,
                    borderColor: tempLineColor,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    pointBackgroundColor: tempPointColor,
                    pointBorderColor: isDark ? '#090e1a' : '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.4, // Smooth curve
                    yAxisID: 'yTemp',
                    order: 1
                },
                {
                    label: 'Rain Probability (%)',
                    type: 'bar',
                    data: rainProbabilities,
                    backgroundColor: rainBarColor,
                    borderColor: rainBarBorderColor,
                    borderWidth: 1.5,
                    borderRadius: 6,
                    barPercentage: 0.5,
                    yAxisID: 'yRain',
                    order: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: textColor,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11,
                            weight: 500
                        },
                        boxWidth: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: isDark ? '#f8fafc' : '#0f172a',
                    bodyColor: isDark ? '#94a3b8' : '#475569',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label.includes('Temperature')) {
                                return ` Temp: ${context.parsed.y}°C`;
                            } else {
                                return ` Rain Prob: ${context.parsed.y}%`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        }
                    }
                },
                yTemp: {
                    type: 'linear',
                    position: 'left',
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        },
                        callback: function(value) {
                            return value + '°';
                        }
                    },
                    title: {
                        display: false
                    }
                },
                yRain: {
                    type: 'linear',
                    position: 'right',
                    grid: {
                        drawOnChartArea: false // Avoid duplicate gridlines
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    min: 0,
                    max: 100,
                    title: {
                        display: false
                    }
                }
            }
        }
    });
}
