# Java client — What is the Camunda Java Client?

The Camunda Java Client is a comprehensive library enabling Java developers to:

- **Deploy processes and decisions** to Camunda 8 clusters
- **Start and manage processes** programmatically
- **Implement job workers** to handle automated tasks within your processes
- **Query and manage process data** via the Orchestration Cluster API

It supports both REST and gRPC protocols, authentication setup, and provides robust error handling with retry mechanisms.

**Info: Migration from Zeebe Java Client**
**The Camunda Java Client replaces the Zeebe Java Client as of version 8.8.**

- Provides improved structure and full Orchestration Cluster API support
- Uses **REST** as default communication protocol (gRPC configurable)
- The Zeebe Java Client will be **removed in version 8.10**
- **Migrate before upgrading to 8.10** to avoid breaking changes

See our [migration guide](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-java-client) for details.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started
