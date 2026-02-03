import { useState } from "react";
import WeatherCard from "./components/WeatherCard";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);

  const [leftCity, setLeftCity] = useState(null);
  const [rightCity, setRightCity] = useState(null);
  const [toggle, setToggle] = useState(true);

  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );

  // Get live weather using Open-Meteo
  const fetchLiveWeather = async (cityName) => {
    try {
      // Get lat/lon
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        return {
          name: cityName,
          main: { temp: "--", humidity: "--" },
          weather: [{ description: "City not found" }],
        };
      }

      const { latitude, longitude, name } = geoData.results[0];

      // Get current weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      const current = weatherData.current_weather;

      return {
        name,
        main: {
          temp: current.temperature,
          humidity: "--", // Open-Meteo current_weather doesn't provide humidity
        },
        weather: [
          {
            description: `Wind ${current.windspeed} km/h`,
          },
        ],
      };
    } catch (error) {
      console.error("Live weather error:", error);
      return {
        name: cityName,
        main: { temp: "--", humidity: "--" },
        weather: [{ description: "Error fetching weather" }],
      };
    }
  };

  // SEARCH → live weather
  const handleSearch = async () => {
    if (!city) return;

    const data = await fetchLiveWeather(city);
    setWeather(data);

    setLeftCity(null);
    setRightCity(null);
    setToggle(true);
  };

  // COMPARE → live weather
  const handleCompare = async () => {
    if (!city) return;

    const data = await fetchLiveWeather(city);
    setWeather(null);

    if (toggle) {
      setLeftCity(data);
    } else {
      setRightCity(data);
    }

    setToggle(!toggle);
  };

  const saveFavorite = () => {
    if (!city || favorites.includes(city)) return;
    const updated = [...favorites, city];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const removeFavorite = (cityName) => {
    const updated = favorites.filter((f) => f !== cityName);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <div className="container">
      <h1>🌤 Weather App</h1>

      <div className="search-box">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleCompare}>Compare</button>
        <button onClick={saveFavorite}>Save</button>
      </div>

      {weather && <WeatherCard data={weather} />}

      {(leftCity || rightCity) && (
        <div className="compare">
          <div className="side">{leftCity && <WeatherCard data={leftCity} />}</div>
          <div className="side">{rightCity && <WeatherCard data={rightCity} />}</div>
        </div>
      )}

      <div className="favorites">
        <h3>⭐ Favorite Cities</h3>
        {favorites.map((f) => (
          <div
            key={f}
            style={{ display: "inline-flex", alignItems: "center", margin: "5px" }}
          >
            <button onClick={() => setCity(f)}>{f}</button>
            <span
              onClick={() => removeFavorite(f)}
              style={{
                marginLeft: "6px",
                cursor: "pointer",
                color: "red",
                fontWeight: "bold",
              }}
            >
              ❌
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
