# HTTP Polling connector — Configuring the HTTP Polling connector

### Authentication

Navigate to the **Authentication** section and select your desired **Authentication type** (e.g., Basic, OAuth). Refer to the [Authentication section of the REST connector documentation](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#authentication) for a comprehensive guide.

### HTTP polling configuration

- **Method**: Choose the HTTP method for your request, e.g., GET, POST, PUT.
- **URL**: Enter the URL of the targeted HTTP endpoint.
- **Headers** (Optional): Input required headers as per the external service. Learn more about headers in the [REST connector headers](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#http-headers) section.
- **Query Parameters** (Optional): Add necessary query parameters for the endpoint. More details can be found in the [REST connector query parameters](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#query-parameters) section.
- **Interval** (Optional): Set the frequency for polling the endpoint in ISO 8601 durations format. The default interval is 50 seconds. Review [how to configure a time duration](https://docs.camunda.io/docs/next/components/modeler/bpmn/timer-events/timer-events#time-duration) for details.
- **Connection Timeout**: Define how long (in seconds) the connector waits before timing out. Further information on this can be found [here](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#connection-timeout).

### Payload configuration (optional)

In the **Payload** section, you can include a **request body**. Learn more about this [here](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#request-body).

### Condition to proceed

1. **Correlation key (process)**: Defines the correlation key based on the process instance.
   - **Example**: Using a process variable named `orderId`:
     ```
     Correlation key (process): =orderId
     ```

2. **Correlation key (payload)**: Extracts the correlation key from the polled data.
   - **Example**: With data like `{"orderId": "123"}`:
     ```
     Correlation key (payload): =body.orderId
     ```

3. **Activation Condition**: Checks if the polled data meets criteria to activate the intermediate catch event.
   - **Example**: If the data should have a `status` of "OK":
     ```
     Activation Condition: =(body.status = "OK")
     ```

For more information about correlation keys, review the [messages guide](https://docs.camunda.io/docs/next/components/concepts/messages).

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/polling
