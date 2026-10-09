# Create a credential template — Versioning a credential template

A credential template's `version` must only ever grow more permissive: add optional fields freely, but never remove a field, change its type, or change what an existing value means. If you need a breaking change, publish a new `id` instead (for example `io.camunda:aws-credential:2`) rather than reusing the old one.

This works because of floor semantics: a `Configuration` property's `configurationTemplateVersion` is the minimum version a credential must satisfy, not the version it must match. Bumping your credential template's version doesn't invalidate credentials created against an earlier version. They still satisfy any element template that declares a floor at or below their version. Administrators upgrade a shared credential to a newer version at their own pace, independent of when an element template starts requiring it.

**Note**
Because an in-place credential edit takes effect immediately for every process that references it, testing a credential against its target cluster and connected system, before saving any change, is the critical safety step for whoever manages it, not the version number itself.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/credential-templates
