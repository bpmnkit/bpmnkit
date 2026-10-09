# Configuration — Query page limit

CPT paginates the individual search requests used by assertions, utilities, and the coverage report, with a default page limit of 100 results. If your process tests create a lot of data, such as many process instances or a process with a multi-instance activity, assertions can fail or the coverage report can be incomplete. In that case, increase the query page limit.

In your `application.yml` (or `application.properties`):

```yaml
camunda:
  process-test:
    query-page-limit: 1000
```

In your `/camunda-container-runtime.properties` file:

```properties
queryPageLimit=1000
```

### Property reference

| Property           | Type      | Default | Description                                              |
| ------------------ | --------- | ------- | -------------------------------------------------------- |
| `query-page-limit` | `integer` | `100`   | The maximum number of results to return per paged query. |

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
