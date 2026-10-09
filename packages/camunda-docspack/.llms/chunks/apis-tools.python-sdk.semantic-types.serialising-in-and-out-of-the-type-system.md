# Semantic Types — Serialising in and out of the type system

Semantic types inherit from `str` and validate on construction, so they work transparently:

<!-- snippet-exempt: uses hypothetical db.save/db.load pseudo-code -->

```python
from camunda_orchestration_sdk import ProcessDefinitionKey, ProcessInstanceKey

# --- Serialising out (to storage / JSON / message queue) ---
# A semantic type IS a str, so it works directly with any str API:
process_key: ProcessDefinitionKey = deployment.processes[0].process_definition_key
db.save("process_key", process_key)   # stores the raw string
json.dumps({"key": process_key})      # "2251799813685249"

# --- Deserialising in (from storage / external input) ---
# Wrap the raw string with the type constructor (validates automatically):
raw = db.load("process_key")           # returns a plain str
typed_key = ProcessDefinitionKey(raw)  # validates and wraps the value

result = client.create_process_instance(
    data=ProcessCreationByKey(process_definition_key=typed_key)
)
```

The available semantic types include: `ProcessDefinitionKey`, `ProcessDefinitionId`, `ProcessInstanceKey`, `JobKey`, `IncidentKey`, `DecisionDefinitionKey`, `DecisionDefinitionId`, `DeploymentKey`, `UserTaskKey`, `MessageKey`, `SignalKey`, `TenantId`, `ElementId`, `FormKey`, and others. All are importable from `camunda_orchestration_sdk` or `camunda_orchestration_sdk.semantic_types`.

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/semantic-types
