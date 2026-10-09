# Cluster variables — Manage cluster variables of kind `SECRET_REFERENCE`

A cluster variable of kind `SECRET_REFERENCE` can contain an [Orchestration Cluster secret reference](https://docs.camunda.io/docs/next/reference/glossary#secret-reference-orchestration-cluster), `camunda.secrets.<name>`, in its value. When a process reads the variable in an input mapping, Camunda resolves these references in the background ahead of activation, and injects the resolved values into the job only once it's handed to a worker. A `JSON`-kind variable whose value contains the same text is treated as ordinary text.

Resolving these references requires a secret store to be configured for the physical tenant. Without one, every reference fails permanently as not found, and the job gets a [`SECRET_RESOLUTION_ERROR` incident](https://docs.camunda.io/docs/next/components/concepts/secret-resolution-incidents#resolve-secret-lookup-failures) naming the reference. The job does not stay unactivated with no error pointing at the cause. See [`camunda.secrets.stores.file`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundasecretsstoresfile) to configure a store.

The Admin UI create form has no kind field, so every variable you create there is a `JSON`-kind variable. To create a `SECRET_REFERENCE`-kind variable, use the Orchestration Cluster API with `"kind": "SECRET_REFERENCE"` in the request body, either [globally](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-global-cluster-variable.api) or [for a tenant](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-tenant-cluster-variable.api).

You can manage an existing `SECRET_REFERENCE`-kind variable in the Admin UI:

- Updating its value keeps its kind, and Camunda scans the new value for references. A variable's kind is fixed at creation and cannot be changed.
- The value shown in the variable list and in the variable details is the stored value, so you see the reference text rather than a resolved value.
- Deleting it works the same as deleting any other cluster variable.

For where resolved values appear and where they do not, see [secret resolution and job activation](https://docs.camunda.io/docs/next/components/concepts/secret-resolution-and-job-activation).

---
Source: https://docs.camunda.io/docs/next/components/admin/cluster-variables
