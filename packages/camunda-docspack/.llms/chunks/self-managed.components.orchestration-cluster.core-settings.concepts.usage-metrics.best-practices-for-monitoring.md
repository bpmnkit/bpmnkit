# Usage metrics — Best practices for monitoring

- Monitor overall cluster activity by combining process, decision, and task metrics.
- Track trends over time to better understand resource usage and user engagement.
- Integrate metrics into dashboards or automation scripts for centralized monitoring and alerting.


## Deprecated usage metrics actuator endpoints

As of 8.8, the following actuator endpoints are **deprecated** and will be removed in the 8.10 release.  
Use the [new usage metrics endpoint](#usage-metrics-endpoint-recommended) instead.

| Endpoint                                     | Description                | Status     |
| -------------------------------------------- | -------------------------- | ---------- |
| `/actuator/usage-metrics/process-instances`  | Total process instances    | Deprecated |
| `/actuator/usage-metrics/decision-instances` | Total decision instances   | Deprecated |
| `/actuator/usage-metrics/assignees`          | Unique user task assignees | Deprecated |

**All endpoints accept:**

- `startTime` (optional)
- `endTime` (optional)
- `tenantId` (optional)

Format: `yyyy-MM-dd'T'HH:mm:ss.SSSZZ` (e.g., `1970-11-14T10:50:26.963-0100`)

The actuator endpoint is exposed on the management port, which defaults to `9600`. The URL must include the Operate context path (`/operate` by default).

### Examples

**Process instances:**

```
http://<host>:9600/operate/actuator/usage-metrics/process-instances?startTime={startTime}&endTime={endTime}&tenantId={tenantId}
```

_Response:_

```json
{
  "total": 99
}
```

**Decision instances:**

```
http://<host>:9600/operate/actuator/usage-metrics/decision-instances?startTime={startTime}&endTime={endTime}&tenantId={tenantId}
```

_Response:_

```json
{
  "total": 80
}
```

**Task assignments:**

```
http://<host>:9600/operate/actuator/usage-metrics/assignees?startTime={startTime}&endTime={endTime}&tenantId={tenantId}
```

_Response:_

```json
{
  "total": 2
}
```

**Warning: Breaking change**
Assignees list removed from response.

This endpoint allows reconciliation of users across multiple cluster components and provides insights into active task participants.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/usage-metrics
