# Version compatibility checks — Supported upgrade paths

The examples below show representative compatible and incompatible paths. Patch versions can vary as long as minor-version rules are followed.

| Scenario                         | Example              | Compatibility                                              |
| -------------------------------- | -------------------- | ---------------------------------------------------------- |
| Patch upgrade                    | 8.8.1 → 8.8.3        | Compatible                                                 |
| Minor upgrade (single step)      | 8.7.5 → 8.8.3        | Compatible                                                 |
| Minor upgrade (skipping a minor) | 8.6.9 → 8.8.3        | Incompatible                                               |
| Patch downgrade                  | 8.8.3 → 8.8.1        | Incompatible (broker); secondary storage skips (see below) |
| Minor downgrade                  | 8.8.3 → 8.7.5        | Incompatible (broker); secondary storage skips (see below) |
| Major change                     | 8.x ↔ 9.x            | Incompatible                                               |
| Alpha build involved             | 8.8.0-alpha1 ↔ 8.8.0 | Incompatible                                               |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/version-compatibility
