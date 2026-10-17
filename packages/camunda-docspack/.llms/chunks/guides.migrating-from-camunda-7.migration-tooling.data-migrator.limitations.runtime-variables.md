# Limitations — Runtime — Variables

- [Unsupported Camunda 7 types](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables#unsupported-types).
- [Camunda 8 variable name restrictions](https://docs.camunda.io/docs/next/components/concepts/variables#variable-values).
  - Variables that do not follow the restrictions will cause issues in FEEL expression evaluation.
- Variables set into the scope of embedded sub-processes are not supported yet and will be ignored.
  - See https://github.com/camunda/camunda-bpm-platform/issues/5235

**Info**
To learn more about variable migration, see [variables](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables).

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations
