# Run without secondary storage — Error handling and API responses

If you attempt to access a disabled feature, the system returns a descriptive error response.

For example:

```json
{
  "status": 403,
  "detail": "This endpoint requires secondary storage, but none is set. Configure it using the 'camunda.data.secondary-storage.type' property.",
  "instance": "/v2/decision-instances/search"
}
```

- At startup, affected components log a warning and shut down gracefully.
- SDKs and clients will also return a `403 Forbidden` error when interacting with unsupported endpoints.


## Limitations and considerations

Using this mode significantly reduces Camunda’s capabilities:

| Limitation                      | Impact                                                         |
| ------------------------------- | -------------------------------------------------------------- |
| No visual monitoring            | Operate, Tasklist, and the Identity UI are unavailable.        |
| No historical data or analytics | Optimize, dashboards, and audit records cannot be accessed.    |
| Limited API access              | Most search and query endpoints return `403 Forbidden`.        |
| Reduced observability           | Built-in metrics and secondary storage exporters are disabled. |
| No human task management        | Tasklist and identity-based task assignment are unavailable.   |

**Note**
You can still deploy and execute BPMN and DMN processes using the Zeebe client or REST API endpoints that only rely on the engine.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/no-secondary-storage
