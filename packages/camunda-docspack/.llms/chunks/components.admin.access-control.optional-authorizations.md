# Access control — Optional authorizations

The following optional authorizations can also be defined:

| Authorization type                 | Resource type     | Resource ID                        | Permission                                                                                   |
| :--------------------------------- | :---------------- | :--------------------------------- | :------------------------------------------------------------------------------------------- |
| View audit log entries.            | `AUDIT_LOG`       | `ADMIN` or `*` for all categories. | `READ`                                                                                       |
| Manage global user task listeners. | `GLOBAL_LISTENER` | `*`                                | `CREATE_TASK_LISTENER`, `READ_TASK_LISTENER`, `UPDATE_TASK_LISTENER`, `DELETE_TASK_LISTENER` |

---
Source: https://docs.camunda.io/docs/next/components/admin/access-control
