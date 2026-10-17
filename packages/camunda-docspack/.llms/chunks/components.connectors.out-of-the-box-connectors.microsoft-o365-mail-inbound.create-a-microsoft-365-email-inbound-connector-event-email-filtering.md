# Microsoft 365 email inbound connector — Create a Microsoft 365 email inbound connector event — Email filtering

Optionally filter which emails trigger the process:

#### Simple filter

The simple filter provides the following options:

- **Only Unread**: When enabled (default), only unread emails (`isRead eq false`) will trigger the process. When disabled, all emails (both read and unread) will trigger the process.
- **Subject Contains** (optional): Only fetch emails where the subject contains this text (case-sensitive)
- **From Email Address** (optional): Only fetch emails from this sender address (exact match, for example, `invoice@vendor.com`)

#### Advanced filter

For more complex filtering, use the **Advanced Configuration** section to provide an [OData filter query](https://learn.microsoft.com/en-us/graph/query-parameters#filter-parameter).

**Note**
OData filter queries are evaluated at deployment time and can only use static values or [secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets). They cannot reference process variables. If you need dynamic filtering based on runtime data, use the [Activation Condition](#activation-condition) section instead.

Examples of filters not supported by the simple filter:

Filter emails from a specific domain:

```
endswith(from/emailAddress/address, '@example.com') and isRead eq false
```

Filter emails whose body contains specific text:

```
contains(body/content, 'password') and isRead eq false
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
