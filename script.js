// ============================
// ELEMENTS
// ============================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const loader = document.getElementById("loader");
const errorBox = document.getElementById("errorBox");

const weatherCard = document.getElementById("weatherCard");

const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");

const currentTime = document.getElementById("currentTime");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const updatedAt = document.getElementById("updatedAt");

const historyContainer = document.getElementById("historyContainer");
const clearHistory = document.getElementById("clearHistory");

// ============================
// CLOCK
// ============================

let activeClock = null;

// ============================
// WEATHER ICONS
// ============================

const WEATHER_CODES = {
    0: {
        text: "Clear Sky",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/clear-day.svg"
    },

    1: {
        text: "Mainly Clear",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/partly-cloudy-day.svg"
    },

    2: {
        text: "Partly Cloudy",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/partly-cloudy-day.svg"
    },

    3: {
        text: "Cloudy",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/cloudy.svg"
    },

    45: {
        text: "Fog",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/fog.svg"
    },

    48: {
        text: "Fog",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/fog.svg"
    },

    51: {
        text: "Drizzle",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/drizzle.svg"
    },

    53: {
        text: "Drizzle",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/drizzle.svg"
    },

    55: {
        text: "Heavy Drizzle",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/drizzle.svg"
    },

    61: {
        text: "Rain",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/rain.svg"
    },

    63: {
        text: "Rain",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/rain.svg"
    },

    65: {
        text: "Heavy Rain",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/rain.svg"
    },

    71: {
        text: "Snow",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/snow.svg"
    },

    73: {
        text: "Snow",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/snow.svg"
    },

    75: {
        text: "Heavy Snow",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/snow.svg"
    },

    80: {
        text: "Rain Showers",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/rain.svg"
    },

    81: {
        text: "Rain Showers",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/rain.svg"
    },

    82: {
        text: "Heavy Showers",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/extreme-rain.svg"
    },

    95: {
        text: "Thunderstorm",
        icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/thunderstorms-rain.svg"
    }
};

// ============================
// UI HELPERS
// ============================

function showLoader() {
    loader.classList.remove("hidden");
}

function hideLoader() {
    loader.classList.add("hidden");
}

function hideError() {
    errorBox.classList.add("hidden");
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
}

// ============================
// THEME HANDLING
// ============================

function setTheme(weatherCode, timezone) {

    const localHour = Number(
        new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            hour12: false,
            timeZone: timezone
        }).format(new Date())
    );

    const isNight =
        localHour >= 19 ||
        localHour <= 5;

    if (isNight) {
        document.body.className = "theme-night";
        return;
    }

    if ([0,1].includes(weatherCode)) {
        document.body.className = "theme-day";
    }
    else if ([2,3,45,48].includes(weatherCode)) {
        document.body.className = "theme-cloudy";
    }
    else if (
        [51,53,55,61,63,65,80,81,82,95]
        .includes(weatherCode)
    ) {
        document.body.className = "theme-rain";
    }
    else {
        document.body.className = "theme-snow";
    }
}

// ============================
// LIVE CITY CLOCK
// ============================

function startClock(timezone) {

    if (activeClock) {
        clearInterval(activeClock);
    }

    function update() {

        const time =
            new Intl.DateTimeFormat(
                "en-US",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                    timeZone: timezone
                }
            ).format(new Date());

        currentTime.textContent = time;
    }

    update();

    activeClock =
        setInterval(update, 1000);
}

// ============================
// HISTORY
// ============================

function getHistory() {

    return JSON.parse(
        localStorage.getItem("skycast-history")
    ) || [];
}

function saveHistory(city) {

    let history = getHistory();

    history = history.filter(
        item =>
            item.toLowerCase() !== city.toLowerCase()
    );

    history.unshift(city);

    history = history.slice(0, 6);

    localStorage.setItem(
        "skycast-history",
        JSON.stringify(history)
    );

    renderHistory();
}

function renderHistory() {

    const history = getHistory();

    historyContainer.innerHTML = "";

    history.forEach(city => {

        const item =
            document.createElement("div");

        item.className = "history-item";

        item.textContent = city;

        item.addEventListener(
            "click",
            () => fetchWeatherByCity(city)
        );

        historyContainer.appendChild(item);
    });
}

clearHistory.addEventListener("click", () => {

    localStorage.removeItem(
        "skycast-history"
    );

    renderHistory();
});

// ============================
// DISPLAY WEATHER
// ============================

function displayWeather(weather, location) {

    const weatherInfo =
        WEATHER_CODES[
            weather.current.weather_code
        ] || {
            text: "Unknown",
            icon: "https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/all/not-available.svg"
        };

    weatherIcon.src =
        weatherInfo.icon;

    condition.textContent =
        weatherInfo.text;

    temperature.textContent =
        `${Math.round(weather.current.temperature_2m)}°C`;

    cityName.textContent =
        location.name;

    countryName.textContent =
        location.country;

    feelsLike.textContent =
        `${Math.round(weather.current.apparent_temperature)}°C`;

    humidity.textContent =
        `${weather.current.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${Math.round(weather.current.wind_speed_10m)} km/h`;

    updatedAt.textContent =
        new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    startClock(location.timezone);

    setTheme(
        weather.current.weather_code,
        location.timezone
    );

    weatherCard.classList.remove("hidden");
}

// ============================
// WEATHER API
// ============================

async function fetchWeather(
    latitude,
    longitude,
    location
) {

    try {

        const response =
            await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
            );

        if (!response.ok) {
            throw new Error();
        }

        const weather =
            await response.json();

        displayWeather(
            weather,
            location
        );

    }
    catch {

        showError(
            "Unable to fetch weather information."
        );
    }
}

// ============================
// CITY SEARCH
// ============================

async function fetchWeatherByCity(city) {

    if (!city.trim()) {

        showError(
            "Please enter a city name."
        );

        return;
    }

    showLoader();
    hideError();

    try {

        const response =
            await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
            );

        const data =
            await response.json();

        if (
            !data.results ||
            data.results.length === 0
        ) {
            throw new Error();
        }

        const cityData =
            data.results[0];

        const location = {

            name: cityData.name,

            country:
                cityData.country,

            timezone:
                cityData.timezone
        };

        saveHistory(cityData.name);

        await fetchWeather(
            cityData.latitude,
            cityData.longitude,
            location
        );

    }
    catch {

        showError(
            "City not found. Try another city."
        );
    }
    finally {

        hideLoader();
    }
}

// ============================
// CURRENT LOCATION
// ============================
function fetchCurrentLocation() {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported."
        );

        return;
    }

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {

                const weatherResponse =
                    await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
                    );

                const weatherData =
                    await weatherResponse.json();

                const location = {
                    name: "Your Location",
                    country: "",
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                };

                displayWeather(
                    weatherData,
                    location
                );

            } catch {

                showError(
                    "Unable to fetch weather data."
                );
            }
        },

        () => {

            showError(
                "Location permission denied."
            );
        }
    );
}

// ============================
// EVENTS
// ============================

searchBtn.addEventListener(
    "click",
    () =>
        fetchWeatherByCity(
            cityInput.value
        )
);

cityInput.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {

            fetchWeatherByCity(
                cityInput.value
            );
        }
    }
);

locationBtn.addEventListener(
    "click",
    fetchCurrentLocation
);

// ============================
// INIT
// ============================

renderHistory();
fetchCurrentLocation();