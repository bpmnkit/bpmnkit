# HTTP Webhook connector — Return data from your HTTP Webhook connector — Response expression

**Note**
Prior to 8.6, the HTTP Webhook connector supported a response body expression.
As of 8.6, this was replaced with a more powerful construct that allows control over
not only the response body, but also the headers and the HTTP status returned by
the connector.

#### Use the request

You can use a response expression to return data after the webhook has been invoked. You can use FEEL to return the request body, headers, and the HTTP status to the client invoking the Webhook connector endpoint.

For example, given a webhook request with the payload body:

```json
{
  "myDataKey1": "myValue1",
  "myDataKey2": "myValue2"
}
```

You can return `myValue1` in a new key `myCustomKey` with a response expression such as:

```json
={
  "body": {"myCustomKey": request.body.myDataKey1}
}
```

The default HTTP status code is `200`. You can change it by including a `statusCode` key in your expression:

```json
={
  "body": "hello",
  "statusCode": 201
}
```

Headers are also supported, using the `headers` key in the response expression:

```json
={
  "headers": {"Content-Type": "text/html"},
  "body": "<h1>Hello world!</h1>"
}
```

When working with `request` data, use the following references to access data:

- Body: `request.body.`.
- Headers: `request.headers.`.
- URL parameters: `request.params.`.

You can also use FEEL expressions to modify the data you return.

#### Use the `correlation` object

When using the Webhook connector with a start event that correlates a message, you can access the `correlation` object in the response expression.
In addition to the `request` object you have access to the `correlation` result.

The data available via the `correlation` object depends on the type of BPMN element you are using the Webhook connector with.

The following overview summarizes the different data points available when using the Webhook connector with different element types and configuration options.

**`correlation` payload by response mode**

The table below shows which `correlation` result type is produced for each supported BPMN element type and response mode.

The result type determines what is available in the **response expression** context (`correlation` property) and in the HTTP response returned to the caller.

  *Element Type*
  Response mode: **Synchronous**
  Response mode: **Asynchronous**

  **Start Event**
   
  ```
  { 
    "processInstanceKey": 123,
    "tenantId": "abc", 
    "variables": {...}
  }
```
The `variables` contain the result of the process execution.

  ```
  { 
    "processInstanceKey": 123,
    "tenantId": "abc"
  }
```
The result of the process execution is not available, but it can be fetched via the API using the `processInstanceKey`.

  
    **Message Start Event**

    **Intermediate Catch Event**

    **Boundary Event**

    **Receive Task**

  
   
  ```
  { 
    "processInstanceKey": 123,
    "messageKey": 123,
    "tenantId": "abc"
  }
```
The `processInstanceKey` contains the first process instance key with which the message correlated.

  ```
  { 
    "messageKey": 123,
    "tenantId": "abc"
  }
```
The message is buffered and only the `messageKey` is returned. Correlation to a subscription happens asynchronously in the engine.

A start event with a message definition uses message publishing internally to correlate an incoming request with Zeebe.

A successful correlation therefore publishes a message, and the `correlation` object contains the following properties when using the `asynchronous` response mode:

```json
{
  "messageKey": 2251799813774245,
  "tenantId": "<default>"
}
```

If a Webhook request is processed more than once using the same _Message ID_ (for example, because of a retry), the `correlation` object is empty.

A start event without a message creates a new process instance. You therefore have access to the newly created process instance key when accessing the `correlation` object:

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook
