# Semantic Types — How to use them

Treat semantic types as **opaque identifiers** — receive them from API responses and pass them to subsequent API calls without inspecting or transforming the underlying value:

<!-- snippet-source: examples/readme.py | regions: ReadmeSemanticTypes -->

```python
from camunda_orchestration_sdk import CamundaClient, ProcessCreationByKey

client = CamundaClient()

# Deploy → the response already carries typed keys
deployment = client.deploy_resources_from_files(["process.bpmn"])
process_key = deployment.processes[0].process_definition_key  # ProcessDefinitionKey

# Pass it directly to another call — no conversion needed
result = client.create_process_instance(
    data=ProcessCreationByKey(process_definition_key=process_key)
)

# The result also carries typed keys
instance_key = result.process_instance_key  # ProcessInstanceKey
client.cancel_process_instance(process_instance_key=instance_key)
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/semantic-types
