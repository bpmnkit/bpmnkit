# Run or publish your process — Run a process — Before running a process

If the target cluster has [authorizations](https://docs.camunda.io/docs/next/components/admin/authorization) enabled, make sure that the users running the process are assigned to both:

- The `CREATE_PROCESS_INSTANCE` permission to the `PROCESS_DEFINITION` resource type
- The `CREATE` permission to the `RESOURCE` resource type

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process
