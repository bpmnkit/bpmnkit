# Run without secondary storage

Run Zeebe clusters using only the engine and primary storage components, disabling all secondary-storage-dependent features.

Use **no secondary storage** mode to run Zeebe clusters with only the process engine and its primary storage layer.

**Warning**
Disabling secondary storage removes key Orchestration Cluster capabilities, including Operate, Tasklist, Identity, and search-based REST endpoints. This mode is suitable only for lightweight development, testing, or specialized technical use cases.


## About this mode

Typically, you should use secondary storage in nearly all production environments to enable monitoring, analytics, querying, and human-task management through Orchestration Cluster applications.

You should **only** disable/run without secondary storage in limited scenarios, such as lightweight development environments, specialized technical use cases, or resource-constrained deployments.

- In this mode, Operate, Tasklist, Identity, and web-based APIs are automatically disabled.
- For Helm deployments, Optimize is also disabled by default when secondary storage is not configured.
- For Docker or manual deployments, you must **explicitly disable Optimize** in your configuration, as it cannot function without secondary storage.

This setup provides core process execution and orchestration capabilities through Zeebe, but excludes the full Camunda experience, such as analytics, search, and human-task management.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/no-secondary-storage
