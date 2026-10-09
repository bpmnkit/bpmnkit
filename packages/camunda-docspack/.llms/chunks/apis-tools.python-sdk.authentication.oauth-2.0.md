# Authentication — OAuth 2.0

```bash
CAMUNDA_REST_ADDRESS=https://cluster.example/v2
CAMUNDA_AUTH_STRATEGY=OAUTH
CAMUNDA_CLIENT_ID=your-client-id
CAMUNDA_CLIENT_SECRET=your-client-secret
# Optional:
# CAMUNDA_OAUTH_URL=https://login.cloud.camunda.io/oauth/token
# CAMUNDA_TOKEN_AUDIENCE=zeebe.camunda.io
```


## Basic authentication

```bash
CAMUNDA_REST_ADDRESS=http://localhost:8080/v2
CAMUNDA_AUTH_STRATEGY=BASIC
CAMUNDA_BASIC_AUTH_USERNAME=your-username
CAMUNDA_BASIC_AUTH_PASSWORD=your-password
```

Or programmatically:

<!-- snippet-source: examples/readme.py | regions: ReadmeBasicAuth -->

```python
from camunda_orchestration_sdk import CamundaClient

client = CamundaClient(
    configuration={
        "CAMUNDA_REST_ADDRESS": "http://localhost:8080/v2",
        "CAMUNDA_AUTH_STRATEGY": "BASIC",
        "CAMUNDA_BASIC_AUTH_USERNAME": "your-username",
        "CAMUNDA_BASIC_AUTH_PASSWORD": "your-password",
    }
)
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/authentication
