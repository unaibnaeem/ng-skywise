# Skywise 🌤️

A minimalist weather application built with **Angular 20** and the **OpenWeatherMap API**. Search for cities, view current weather and a five-day forecast, save favorite locations, and switch between light and dark themes.

## ✨ Features

- **Current Weather** — View current conditions for selected cities.
- **Five-Day Forecast** — Explore upcoming weather using forecast data grouped by day.
- **City Search** — Search for locations with autocomplete suggestions powered by geocoding.
- **Keyboard Navigation** — Navigate search suggestions using the keyboard.
- **Recent Cities** — Quickly revisit recently viewed locations.
- **Favorites** — Save and manage favorite cities.
- **Light and Dark Themes** — Switch themes with saved preferences.
- **Local Storage** — Persist favorites, recent cities, and theme preferences across sessions.
- **Lazy-Loaded Routes** — Load Home, Favorites, and Weather Details pages on demand.
- **Responsive Interface** — A clean, minimalist design for checking the weather.

## 🛠️ Built With

- [Angular 20](https://angular.dev/)
- TypeScript
- HTML and CSS
- [OpenWeatherMap API](https://openweathermap.org/api)
- Angular Router
- Angular HttpClient
- Angular Signals
- Browser Local Storage
- Angular testing tools

## 🚀 Getting Started

### Prerequisites

- Node.js and npm compatible with Angular 20
- Angular CLI
- An OpenWeatherMap API key

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd weather-app
```

Replace `<your-repository-url>` with your Git repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your API key

Add your OpenWeatherMap API key to the environment configuration used by your application.

For example, if your project uses `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  weatherApiKey: "YOUR_OPENWEATHERMAP_API_KEY",
};
```

Use the property name expected by your existing services. If your project already has an environment configuration, update it rather than creating a duplicate.

**Security note:** API keys included in frontend applications can be inspected by users. Avoid committing private credentials to a public repository, and configure appropriate restrictions where supported.

### 4. Run the application

```bash
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

## 🧭 Application Routes

| Route                | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `/`                  | Home page with recent cities and weather information      |
| `/favorites`         | View and manage favorite cities                           |
| `/weather/:lat/:lon` | View weather details for a location using its coordinates |
| Unknown routes       | Redirect to the home page                                 |

The main pages are lazy-loaded through Angular Router.

## 🧪 Testing

Run the unit test suite:

```bash
ng test
```

**Latest verified test result:** 82 specs, 0 failures.

The test suite covers services, components, local storage behavior, search interactions, weather API requests, forecast grouping, and route navigation.

## 🏗️ Production Build

Create a production build with:

```bash
ng build
```

The generated application files are placed in:

```text
dist/weather-app
```

The production build has been verified successfully.

## 🌦️ Weather Data

Weather information is retrieved from OpenWeatherMap. City autocomplete uses geocoding data to identify locations and obtain their coordinates.

An active API key and internet connection are required for live weather data. ☁️
