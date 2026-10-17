# Cluster inspection and process management — Search — Search wait states

Wait states are the points where a process instance is waiting — an open job, a message subscription, a timer, a condition, a user task, or a signal. Use `search wait-state` (alias `ws`) to find them:

```bash
# All wait states for a process instance
c8 search ws --processInstanceKey=2251799813685249

# Filter by wait state type (JOB, MESSAGE, TIMER, CONDITION, USER_TASK, SIGNAL)
c8 search ws --waitStateType=JOB

# Filter by BPMN element type, or by element ID (supports wildcards)
c8 search ws --elementType=SERVICE_TASK
c8 search ws --elementId='*Approve*'
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
