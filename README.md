# SkyGlass // Modern Futuristic Weather Dashboard

SkyGlass is a premium, state-of-the-art web application dashboard built with HTML5, CSS3, and Vanilla ES6 JavaScript. The application displays current conditions, air pollution details, hourly temperatures, and rain probability graphs using a highly optimized glassmorphism aesthetic.

---

## 🌟 Key Features

- **Futuristic Glassmorphism Aesthetic:** Translucent components utilizing CSS backdrop blurs, soft neon accent glows, and harmonious dark/light templates.
- **Dynamic Weather Backgrounds:** Interactive animations representing live weather categories (smooth rain drops, drifting flakes, scrolling fog banks, lightning discharges, and pulsing solar beams) running at 60 FPS using GPU-friendly CSS keyframes.
- **Vector Weather Graphics:** Customized vector SVG condition icons featuring micro-animations (spinning suns, floating clouds, and bouncing drops) that render crisply on high-DPI screens.
- **Hourly Forecast Chart:** Interactive visualization powered by Chart.js combining temperature tracks (curves) and rain probability percentage (gradient vertical bars).
- **Responsive Scrollable Cards:** Single-column stacks on tablets and horizontal swipeable decks on small mobile screens.
- **Air Quality Gauge:** Real-time AQI reports with colored health indicator gauges and complete chemical metrics (PM2.5, PM10, Ozone, CO, NO2).
- **Persistent Settings:** Caches current search criteria and light/dark theme selections locally inside `localStorage`.
- **Preloader Skeletons:** Animated shimmering placeholders that occupy cards while data fetches, avoiding content layout shifts (CLS).
- **Auto-Detect Geolocation:** Connects to HTML5 Geolocation API, falling back gracefully to a default city if denied.
- **API Key Fallback Protection:** Integrates a mock-data engine that generates beautiful, realistic weather values deterministic to the search string if offline or rate-limited.

---

## 📂 Folder Structure

```
weather-dashboard/
│
├── index.html            # Main markup skeleton with widgets, skeletons, and CDNs
│
├── css/
│   ├── style.css         # Global variables, fonts, glass layout grid, and forms
│   ├── responsive.css    # Responsive breakpoints and touch horizontal scrolling
│   └── animations.css    # Keyframes for skeletons, fade-ins, and active backgrounds
│
├── js/
│   ├── app.js            # Central app controller, clock, geolocations, history, and autocomplete
│   ├── api.js            # OpenWeatherMap API wrapper and mock data fallback engine
│   ├── ui.js             # SVG graphics, toast notices, background triggers, and DOM fillers
│   ├── forecast.js       # Chart.js initialization and hourly/daily data grouping
│   └── theme.js          # Persistent light/dark scheme switches and theme event handlers
│
└── README.md             # Project documentation and deployment guidelines
```

---

## 🚀 Getting Started

### Prerequisites

You need a modern web browser (Google Chrome, Firefox, Safari, Microsoft Edge). No server-side runtime, compiler, or build system (Node.js, Webpack, etc.) is required.

### Local Development

1. Clone or download this project folder onto your local machine.
2. Open `index.html` directly in your browser:
   - Double-click the file, or
   - Right-click and choose **Open with...** -> **Google Chrome** (or your preferred browser).
3. Alternatively, for a better development experience, run it using a local server extension (like VS Code **Live Server**) to avoid potential CORS limitations with some browsers.

### API Configuration

The project is pre-configured with a working OpenWeatherMap API key:
`4429ebc4201994f3ef2e858dda8a0831`

If you need to change the API key:
1. Open the [api.js](file:///c:/Users/Danish%20Amazon/Desktop/Weather%20app/js/api.js) file.
2. Locate the line: `const API_KEY = '4429ebc4201994f3ef2e858dda8a0831';`
3. Replace the string with your own API key obtained from [OpenWeatherMap](https://openweathermap.org/).

---

## 🎨 Theme Configuration

SkyGlass is built using CSS variables, making it easy to tweak colors:
- To modify themes, edit the `:root` and `.light-theme` sections in `css/style.css`.
- Core parameters like border-radius (`--border-radius-lg`), font-family, and transition speeds are controlled by CSS variables for rapid global customization.

---

## 🚢 Deployment

SkyGlass is fully static and contains zero backend code, making it instantly deployable to:

### Vercel / Netlify
1. Log in to Vercel or Netlify.
2. Connect your GitHub repository or drag-and-drop the project directory directly into the dashboard.
3. Deploys in less than 30 seconds.

### GitHub Pages
1. Push this directory to a public GitHub repository.
2. Go to repository **Settings** -> **Pages**.
3. Under **Build and deployment**, select `main` branch and `/` root directory.
4. Save and copy the generated URL.

## Update
Testing GitHub achievements.