# Cluster inspection and process management — Search — Wildcard search

String filters support wildcard matching:

- `*` — matches zero or more characters.
- `?` — matches exactly one character.

```bash
c8 search pd --name='*order*'
c8 search pd --id='process-v?'
c8 search jobs --type='*-service'
c8 search variables --name='order*'
```

Wildcard-capable fields per resource:

| Resource            | Fields                   |
| :------------------ | :----------------------- |
| Process definitions | `--name`, `--id`         |
| Process instances   | `--id`                   |
| User tasks          | `--assignee`             |
| Incidents           | `--errorMessage`, `--id` |
| Jobs                | `--type`                 |
| Variables           | `--name`, `--value`      |

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
