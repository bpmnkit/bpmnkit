# Cluster inspection and process management — Search — Date range filtering

Use `--between` to filter results by a date range. Dates can be short (`YYYY-MM-DD`) or full ISO 8601 datetimes. Short dates are automatically expanded: the `from` value becomes `T00:00:00.000Z` and the `to` value becomes `T23:59:59.999Z`.

```bash
# Process instances started today
c8 search pi --between=2025-03-05..2025-03-05

# Process instances within a date range
c8 search pi --between=2025-01-01..2025-03-31

# With full ISO 8601 datetimes
c8 search pi --between=2025-01-01T00:00:00Z..2025-06-30T23:59:59Z
```

You can also use open-ended ranges by omitting one side of the `..` separator:

```bash
# Everything up to (and including) a date
c8 search pi --between=..2025-03-05

# Everything from a date onwards
c8 search pi --between=2025-01-01..

# Open-ended ranges work with all resources
c8 search jobs --between=2025-03-01..
c8 search inc --between=..2025-02-28
```

`--between` is supported on process instances, user tasks, incidents, and jobs. Use `--dateField` to specify which date field to filter on. Each resource has a different default:

| Resource          | Default `dateField` | Available date fields                                       |
| :---------------- | :------------------ | :---------------------------------------------------------- |
| Process instances | `startDate`         | `startDate`, `endDate`                                      |
| User tasks        | `creationDate`      | `creationDate`, `completionDate`, `followUpDate`, `dueDate` |
| Incidents         | `creationTime`      | `creationTime`                                              |
| Jobs              | `creationTime`      | `creationTime`, `lastUpdateTime`                            |

```bash
# Process instances that ended in January
c8 search pi --between=2025-01-01..2025-01-31 --dateField=endDate

# User tasks due this week
c8 search ut --between=2025-03-03..2025-03-07 --dateField=dueDate

# Incidents created today
c8 search inc --between=2025-03-05..2025-03-05

# Jobs created in a date range
c8 search jobs --between=2025-01-01..2025-12-31
```

`--between` also works with the `list` command:

```bash
c8 list pi --between=2025-01-01..2025-03-31
c8 list ut --between=2025-03-01..2025-03-31
c8 list inc --between=2025-03-05..2025-03-05
c8 list jobs --between=2025-01-01..2025-12-31
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
