# @bpmnkit/api — Observability Events

```typescript
client.on("request",  (e) => logger.debug(e.method, e.url));
client.on("response", (e) => metrics.histogram("api.latency", e.durationMs));
client.on("error",    (e) => logger.error(e.url, e.error.message));
client.on("retry",    (e) => logger.warn(`Retrying ${e.url} (attempt ${e.attempt})`));
```

The other events are `rawResponse`, `tokenRefresh`, `cacheHit` and `cacheMiss`.

---
Source: https://bpmnkit.com/docs/packages/api
