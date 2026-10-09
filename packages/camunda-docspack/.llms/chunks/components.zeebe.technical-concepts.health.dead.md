# Health — Dead

When something is marked as dead in a cluster, it means it failed in a non-recoverable way. This means it **will** require human intervention to recover. This is a rare status, but it can happen if data corruption is detected, for example. You should promptly investigate any components with a dead status.

**Note**
Note that it's possible that only parts of the system has failed, and the rest is still working fine. For example, a dead broker can be due to a single partition which has data corruption; other partitions on the same broker may still be processing and working as expected.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/health
