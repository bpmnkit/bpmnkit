# Get started with API orchestration — Make your REST connector executable

Set up your REST connector to get a random cat fact from the [Cat Fact API](https://catfact.ninja/):

1. Select the **REST Outbound Connector**.
2. Under **Properties > HTTP endpoint**, set the **URL** to `https://catfact.ninja/fact`.


## Handle your response

The HTTP response will be available in a temporary local response variable. This variable can be mapped to the process by specifying **Result Variable**.
In the **Output mapping** section use `={"body" : body}` as the **Result Expression** so you can see the entire JSON object returned if it's successful.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-apis
