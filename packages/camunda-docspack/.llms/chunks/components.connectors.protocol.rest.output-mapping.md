# REST connector — Output mapping

### Result variable

You can export a complete response from an HTTP REST call into a dedicated variable accessible anywhere in a process.
To do so, just input a variable name in the **Result variable** field. We recommend using a unique name to avoid
variables being overwritten, for example `currentWeather`.


## Result expression

Additionally, you can choose to unpack the content of your `response` into multiple process variables using the **Result expression**, which is a [FEEL Context Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-context-expressions).

```
= {
    actual_temp: response.body.main.temp,
    feel_temp: response.body.main.feels_like,
    weather: response.body.weather[1].main,
    weather_report_id: response.document.documentId
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/rest
