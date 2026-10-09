# Deploying Resources

# Deploying Resources

Deploy BPMN, DMN, or Form files from disk:

<!-- snippet-source: examples/readme.py | regions: ReadmeDeployResources -->

```python
from camunda_orchestration_sdk import CamundaClient

with CamundaClient() as client:
    result = client.deploy_resources_from_files(["process.bpmn", "decision.dmn"])

    print(f"Deployment key: {result.deployment_key}")
    for process in result.processes:
        print(f"  Process: {process.process_definition_id} (key: {process.process_definition_key})")
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/deploying-resources
