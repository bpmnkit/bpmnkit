# Programmatic configuration (use sparingly)

# Programmatic configuration (use sparingly)

Only use `configuration={...}` when you must supply or mutate configuration dynamically (e.g. tests, multi-tenant routing, or ephemeral preview environments). Keys mirror their `CAMUNDA_*` environment names.

<!-- snippet-source: examples/readme.py | regions: ReadmeProgrammaticConfig -->

```python
from camunda_orchestration_sdk import CamundaClient

client = CamundaClient(
    configuration={
        "CAMUNDA_REST_ADDRESS": "http://localhost:8080/v2",
        "CAMUNDA_AUTH_STRATEGY": "NONE",
    }
)
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/programmatic-configuration-use-sparingly
