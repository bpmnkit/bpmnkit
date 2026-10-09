# Cluster inspection and process management — User tasks

### List user tasks

```bash
c8 list ut
c8 list user-tasks

# Filter by state
c8 list ut --state=CREATED

# Filter by assignee
c8 list ut --assignee=john.doe
```

### Complete a user task

```bash
c8 complete ut 2251799813685250

# With variables
c8 complete ut 2251799813685250 --variables='{"approved":true,"notes":"Looks good"}'
```


## Incidents

### List incidents

```bash
c8 list inc
c8 list incidents

# Filter by state
c8 list inc --state=ACTIVE

# Filter by process instance
c8 list inc --processInstanceKey=2251799813685249
```

### Get an incident

```bash
c8 get inc 2251799813685251
```

### Resolve an incident

```bash
c8 resolve inc 2251799813685251
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
