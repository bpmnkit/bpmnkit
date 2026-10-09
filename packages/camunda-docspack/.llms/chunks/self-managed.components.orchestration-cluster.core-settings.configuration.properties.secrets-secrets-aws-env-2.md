# Property reference — Secrets — secrets-aws-env (2)

In container-secret mode, the named secret's value must be a flat JSON object mapping each reference name to a JSON string value, for example `{"db-password": "s3cr3t"}`. Nested objects and arrays are not supported. If the value is invalid JSON or is not a JSON object, every reference fails to resolve and the list request fails.

If a key is missing or has a JSON `null` value, only that reference fails as not found. If a key exists but its value is not a string, only that reference fails as invalid.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
