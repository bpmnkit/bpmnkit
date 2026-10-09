# Manage secondary storage

Follow best practices to maintain, back up, and monitor your secondary storage data to ensure reliability and performance.

Manage your secondary storage carefully to maintain data integrity, performance, and system stability.

For definitions and conceptual context, see [secondary storage](https://docs.camunda.io/docs/next/reference/glossary#secondary-storage).


## Modifying secondary storage data

**Warning**
You should never manually modify data stored in secondary storage unless instructed by Camunda Support during an active support case. Do not make direct edits to data in secondary storage outside of explicit Camunda Support guidance.

### Risks of manual modification

Unsupervised changes to secondary storage data can lead to severe issues, such as the following:

| Risk                       | Description                                                                                                    |
| :------------------------- | :------------------------------------------------------------------------------------------------------------- |
| Data loss                  | Manual edits may delete or overwrite essential records that cannot be recovered without backups.               |
| Data corruption            | Structural or value changes can leave indices or tables in inconsistent states, leading to application errors. |
| Unsupported system states  | Unapproved modifications may break compatibility with upgrades, patches, or new features.                      |
| Troubleshooting challenges | Custom edits make it difficult for support engineers to diagnose and resolve issues.                           |
| Security vulnerabilities   | Unauthorized changes can expose sensitive data or weaken access controls.                                      |
| Compliance issues          | Altered records may violate internal or external data-integrity regulations.                                   |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/managing-secondary-storage
