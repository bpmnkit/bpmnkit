# Add tools to an AI agent — Return the result as `toolCallResult` — connector-task

In the **Output mapping** section of a connector, set **Result Expression** to map relevant response fields into `toolCallResult`:

```feel
{
  toolCallResult: {
    temperature_celsius: response.body.current.temperature_2m,
    wind_speed_kmh: response.body.current.wind_speed_10m,
    weather_code: response.body.current.weather_code
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent
