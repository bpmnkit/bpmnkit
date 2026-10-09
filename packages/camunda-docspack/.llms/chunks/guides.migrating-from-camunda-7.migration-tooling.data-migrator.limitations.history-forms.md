# Limitations — History — Forms

The History Data Migrator supports migration of Camunda Forms, but with the following limitations:

- Only [Camunda Forms](https://docs.camunda.org/manual/latest/user-guide/task-forms/#camunda-forms) are migrated. Other form types are not supported:
  - Embedded forms (HTML/JSF)
  - External forms (URL-based forms)
  - Generated forms (from form data definitions)
- Supported form bindings:
  - `deployment` - Form version deployed together with the process definition
  - `latest` - Latest version of the form definition
  - `version` - Specific version of the form definition
- Unsupported form bindings:
  - Expression-based bindings (for example, `${formKey}`)

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations
