# Property reference — Secrets — secrets-gcp-env (2)

GCP secret IDs allow only `[a-zA-Z0-9_-]` and are capped at 255 characters. Both `path-prefix` and `container-secret-id` contribute to secret IDs. An AWS-style `camunda/` prefix contains a slash and therefore produces invalid IDs. For GCP, use a prefix such as `camunda-` instead.

Camunda performs the combined-length check only when `container-secret-id` is set. It does not validate the length of per-reference IDs in flat mode at startup, so an overlong prefix is detected only during resolution.

In container-secret mode, the named secret's value must be a flat JSON object mapping each reference name to a JSON string value, for example `{"db-password": "s3cr3t"}`. Nested objects and arrays are not supported: if the value is not valid JSON, or is JSON but not an object, every reference fails to resolve and listing fails outright rather than returning an empty list. If a key is absent, or present with a JSON `null` value, only that one reference fails, as not found; if a key's value is present but not a string, only that one reference fails, as invalid.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
