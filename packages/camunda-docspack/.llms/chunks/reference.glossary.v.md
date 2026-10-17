# Glossary — V

### Variable

A variable stores data for a [process instance](#process-instance) or a local scope within a process. Variables can hold JSON values and are used to pass business data between tasks, expressions, and events.

- [Variables](https://docs.camunda.io/docs/next/components/concepts/variables)

### Version

In Camunda 8, version is an overloaded term. Depending on context, it can refer to a [process definition version](#process-definition-version), a [version tag](#version-tag), a [file version](#version-file) or [project snapshot](#snapshot-project), an [execution platform version](#execution-platform-version), or a SaaS [generation](#generation).

### Version tag

A version tag is a user-defined string label for a specific resource or snapshot.

For deployed BPMN, DMN, and form resources, a version tag can be used to identify a resource version and to resolve dependencies with `versionTag` binding. In Camunda Hub project snapshots, a version tag labels a saved project snapshot.

A version tag is not generated automatically and does not replace the numeric process definition version.

- [Resource binding types](https://docs.camunda.io/docs/next/components/best-practices/modeling/choosing-the-resource-binding-type#versiontag)
- [Project versioning](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/project-versioning)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
