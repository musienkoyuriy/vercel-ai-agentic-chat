export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
}

interface WeatherProps {
  data: WeatherData;
}

export function WeatherCard({ data }: WeatherProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return "☀️";
      case "cloudy":
        return "⛅️";
      case "rainy":
        return "�️";
      case "snowy":
        return "❄️";
      case "foggy":
        return "🌫️";
      case "windy":
        return "🌬️";
    }
  };

  return (
    <div className="bg-linear-to-br from-blue-500 to-blue-700 p-4 rounded-lg text-white shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{data.location}</h3>
        <span className="text-4xl">{getWeatherIcon(data.condition)}</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <h3 className="text-5xl font-bold">{data.temperature}</h3>
        <span className="text-xl opacity-90">F</span>
      </div>
      <div className="text-sm opacity-90 capitalize mb-3">{data.condition}</div>
      <div className="flex items-center gap-2 text-sm">
        <span>Humidity:</span>
        <span className="font-semibold">{data.humidity}%</span>
      </div>
    </div>
  );
}
