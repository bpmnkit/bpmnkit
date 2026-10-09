# Build your first AI agent — Step 4: Add your first tool

You can customize your AI agent by adding tools. In this section, you will add a tool that fetches weather conditions for a given location using the [Open-Meteo API](https://open-meteo.com/).

### Add a REST connector task

1. Inside the AI agent sub-process, add a new task element.
1. Change the task type to [**Send REST Request**](https://docs.camunda.io/docs/next/components/connectors/protocol/rest) using the **Change element** menu.
1. Name the task. For example, `Get current weather`. This name is visible to the LLM as the tool name.

### Write a tool description

The LLM selects tools based on their description. Open the **Documentation** field in the properties panel and add a clear description of what the tool does and when to use it. For example:

```
Fetches current weather conditions for a given location. Use this tool when the user asks about weather, temperature, wind, or climate conditions for a city or place. Returns temperature in Celsius, wind speed, and a weather description.
```

**Tip**
Provide as much context as possible in tool descriptions to help the LLM select the right tool and generate proper inputs.

### Configure the REST connector

Set up the HTTP request in the properties panel:

1. In the **Authentication** section, select **None**.
1. In the **HTTP Endpoint** section:
   - Set **Method** to **GET**.
   - Set **URL** to the following [FEEL expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) by clicking the `fx` icon:

     ```feel
     "https://api.open-meteo.com/v1/forecast"
     ```

   - Set **Query parameters** to:

   ```feel
   {
       latitude: fromAi(toolCall.latitude, "Latitude of the location to check weather for", "string"),
       longitude: fromAi(toolCall.longitude, "Longitude of the location to check weather for", "string"),
       current: "temperature_2m,wind_speed_10m,weather_code"
   }
   ```

The [`fromAi()`](https://docs.camunda.io/docs/next/components/modeler/feel/builtin-functions/feel-built-in-functions-ai-agent#fromaivalue) calls tell the AI Agent connector which parameters the LLM must provide. At runtime, the LLM generates the latitude and longitude values based on the user's request, while the `current` parameter is a fixed value that selects which weather fields to return.

### Map the response to `toolCallResult`

Each tool within the AI agent sub-process must return its result in a `toolCallResult` variable so the AI Agent connector can pass it back to the LLM.

In the **Output Mapping** section, set **Result Expression** to:

```feel
{
    toolCallResult: {
        latitude: response.body.latitude,
        longitude: response.body.longitude,
        temperature_celsius: response.body.current.temperature_2m,
        wind_speed_kmh: response.body.current.wind_speed_10m,
        weather_code: response.body.current.weather_code
    }
}
```

This extracts the relevant fields from the Open-Meteo API response and returns them in a structure the LLM can interpret and summarize for the user.

### Test the new tool

Deploy the updated process and start a new instance. Try prompts like:

- _"What's the weather in Paris right now?"_
- _"Is it windy in Tokyo?"_
- _"Tell me the temperature in New York"_

The LLM will recognize these as weather requests, select the **Get current weather** tool, provide the appropriate latitude and longitude values, and summarize the response in natural language.

### Add your own tools

To add more tools to your agent, follow the same pattern used above.

For more details on adding tools beyond this example, see [add tools to an AI agent](https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent).

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-agentic-orchestration
