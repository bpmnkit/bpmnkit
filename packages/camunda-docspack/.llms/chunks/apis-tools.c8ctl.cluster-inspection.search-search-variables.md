# Cluster inspection and process management — Search — Search variables

```bash
c8 search variables --name=orderId
c8 search variables --value=12345
c8 search variables --processInstanceKey=2251799813685249
c8 search variables --scopeKey=2251799813685260

# Show full (non-truncated) variable values
c8 search variables --name=orderPayload --fullValue
```

By default, long variable values are truncated. Truncated values show a `✓` in the "Truncated" column. Use `--fullValue` to see complete values.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
