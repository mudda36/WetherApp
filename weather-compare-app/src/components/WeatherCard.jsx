export default function WeatherCard({ data }) {
return (
<div className="card">
<h2>{data.name}</h2>
<p>🌡 Temp: {data.main.temp}°C</p>
<p>💧 Humidity: {data.main.humidity}%</p>
<p>☁ Condition: {data.weather[0].description}</p>
</div>
);
}