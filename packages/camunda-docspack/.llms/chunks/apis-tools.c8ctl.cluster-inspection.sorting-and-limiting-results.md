# Cluster inspection and process management — Sorting and limiting results

Use `--sortBy`, `--asc`, and `--desc` to control result ordering, and `--limit` to cap the number of results:

```bash
# Sort process instances ascending by key
c8 list pi --sortBy=key --asc

# Sort user tasks descending by creation time
c8 search ut --state=CREATED --sortBy=creationDate --desc

# Limit results
c8 list pi --limit=10
```


## Output

Search and list results display as tables in text mode:

```text
Key              | Process ID     | State  | Version | Tenant ID
2251799813685260 | order-process  | ACTIVE | 3       | <default>
2251799813685270 | order-process  | ACTIVE | 3       | <default>
Found 2 process instance(s)
```

Switch to JSON for scripting and automation:

```bash
c8 output json
c8 search pi --state=ACTIVE
# [{"processInstanceKey":"2251799813685260", ...}, ...]
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
