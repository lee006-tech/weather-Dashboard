
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

// Search button event
searchBtn.addEventListener("click", getWeather);

// Search using Enter key
cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

// Main asynchronous function
async function getWeather() {

    const city = cityInput.value.trim();
    const message = document.getElementById("message");

    if (city === "") {
        message.textContent = "Please enter a city name!";
        return;
    }

    try {

        message.textContent = "Loading weather data...";

        // Step 1: Get city coordinates
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to connect to server.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found!");
        }

        // Extract nested JSON data
        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Step 2: Fetch weather information
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather information.");
        }

        const weatherData = await weatherResponse.json();

        // Step 3: Extract current weather
        const current = weatherData.current;

        // Step 4: Display weather information
        document.getElementById("cityName").textContent =
            location.name + ", " + (location.country || "");

        document.getElementById("date").textContent =
            "Updated: " + current.time.replace("T", " ");

        document.getElementById("temperature").textContent =
            current.temperature_2m + "°C";

        document.getElementById("humidity").textContent =
            current.relative_humidity_2m + "%";

        document.getElementById("wind").textContent =
            current.wind_speed_10m + " km/h";

        document.getElementById("feelsLike").textContent =
            current.apparent_temperature + "°C";

        // Step 5: Weather description
        const weather = getWeatherDescription(
            current.weather_code
        );

        document.getElementById("description").textContent =
            weather.description;

        document.getElementById("weatherIcon").textContent =
            weather.icon;

        message.textContent = "";

    } catch (error) {

        message.textContent = error.message;

        document.getElementById("cityName").textContent =
            "Weather unavailable";

        document.getElementById("temperature").textContent =
            "--°C";
    }
}

// Convert weather codes into descriptions
function getWeatherDescription(code) {

    if (code === 0) {
        return { description: "Clear Sky", icon: "☀️" };
    }

    if (code <= 3) {
        return { description: "Partly Cloudy", icon: "⛅" };
    }

    if (code === 45 || code === 48) {
        return { description: "Foggy", icon: "🌫️" };
    }

    if (code >= 51 && code <= 67) {
        return { description: "Drizzle / Rain", icon: "🌧️" };
    }

    if (code >= 71 && code <= 77) {
        return { description: "Snow", icon: "❄️" };
    }

    if (code >= 80 && code <= 82) {
        return { description: "Rain Showers", icon: "🌦️" };
    }

    if (code >= 95) {
        return { description: "Thunderstorm", icon: "⛈️" };
    }

    return { description: "Cloudy", icon: "☁️" };
}
