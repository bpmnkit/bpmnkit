# Property reference — Secrets — AWS Secrets Manager store

Configuration for a secret store backed by AWS Secrets Manager. Authentication is always identity-based, via the AWS SDK's default credentials provider chain. No static credentials are accepted at all. Secrets are always read at the `AWSCURRENT` version stage; pinning to a different stage is not supported.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
