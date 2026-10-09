# REST connector — Request — Query parameters

The **Query parameters** field can be configured using the [FEEL Map](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-data-types#context) data type.

```text
= {
    q: "Berlin",
    appid: "{{secrets.OPEN_WEATHER_MAP_API_KEY}}",
    units: "metric",
    lang:"en"
}
```

**Note**
Secrets are not like regular variables and must be wrapped in double quotes (`"`) when used in an expression.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/rest
