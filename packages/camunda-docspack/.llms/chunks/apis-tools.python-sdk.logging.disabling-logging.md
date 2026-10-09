# Logging — Disabling logging

Pass an instance of `NullLogger` to silence all SDK output:

<!-- snippet-source: examples/readme.py | regions: ReadmeDisableLogging -->

```python
from camunda_orchestration_sdk import CamundaClient, NullLogger

client = CamundaClient(logger=NullLogger())
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/logging
