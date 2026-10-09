# Cluster inspection and process management — Search — Case-insensitive search

Prefix a flag name with `i` to make the filter case-insensitive. Case-insensitive filtering is performed client-side after fetching results.

```bash
c8 search pd --iname='*ORDER*'
c8 search ut --iassignee=John
c8 search jobs --itype='*Service*'
c8 search inc --ierrorMessage='*timeout*'
c8 search variables --iname='OrderId'
```

Case-insensitive flags per resource:

| Resource            | Flags                      |
| :------------------ | :------------------------- |
| Process definitions | `--iname`, `--iid`         |
| Process instances   | `--iid`                    |
| User tasks          | `--iassignee`              |
| Incidents           | `--ierrorMessage`, `--iid` |
| Jobs                | `--itype`                  |
| Variables           | `--iname`, `--ivalue`      |

**Note**
Case-insensitive filtering fetches up to 1000 results from the server and filters client-side. For large result sets, combine with case-sensitive filters to narrow results first.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
