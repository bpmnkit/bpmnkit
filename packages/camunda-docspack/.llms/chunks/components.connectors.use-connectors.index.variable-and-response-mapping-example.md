# How to use connectors — Variable and response mapping — Example

Imagine your connector makes an external call to an arbitrary weather service. The weather service returns the following
response:

```json
{
  "status": 200,
  "headers": {
    "date": "Thu, 19 Jan 2023 14:02:29 GMT",
    "transfer-encoding": "chunked",
    "content-type": "application/json; charset=utf-8",
    "connection": "keep-alive"
  },
  "body": {
    "latitude": 52.52,
    "longitude": 13.4,
    "generationtime_ms": 0.22804737091064453,
    "utc_offset_seconds": 0,
    "timezone": "GMT",
    "timezone_abbreviation": "GMT",
    "elevation": 45.0,
    "current_weather": {
      "temperature": 1.0,
      "windspeed": 10.1,
      "winddirection": 186.0,
      "weathercode": 2,
      "time": "2023-01-19T14:00"
    }
  }
}
```

If you declare a variable `myWeatherResponse` in the **Result Variable** field, the entire response is mapped to the
declared variable.

Now, let's imagine that you wish to extract only temperature into a process variable `berlinWeather` and wind speed into
`berlinWindSpeed`. Let's also imagine you need weather in Fahrenheit declared in `berlinWeatherInFahrenheit`.

In that case, you could declare **Result Expression** as follows:

```
= {
  berlinWeather: response.body.current_weather.temperature,
  berlinWindSpeed: response.body.current_weather.windspeed,
  berlinWeatherInFahrenheit: response.body.current_weather.temperature * 1.8 + 32
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
