# Document handling configuration — Supported storage options

- By using **external cloud file bucket storage**, documents can be stored in a secure and scalable way. Buckets are integrated per cluster to ensure proper isolation and environment-specific management. The following file bucket storage options are supported:
  - [**Google Cloud Platform (GCP)**](https://cloud.google.com/storage)
  - [**AWS S3**](https://aws.amazon.com/s3/) — including [S3-compatible object stores](https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/helm#s3-compatible-object-storage) such as MinIO, Cloudian, or Garage (configured through the AWS S3 store with a custom endpoint)
  - [**Azure Blob Storage**](https://azure.microsoft.com/en-us/products/storage/blobs)
  - Configuring these storages is supported in [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run), [Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose), and [Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install).
- **Local storage** can be configured for a cluster to store documents in a local folder.
  - It can be used only for local development with [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run).
  - Local storage is not suitable for production use, as pods and file paths are not shared across components. This prevents components like Tasklist and Zeebe from accessing the same data. Files are stored locally, and their retention must be managed manually.
  - If you're using a container image and a mounted volume for your storage, you can use the path `/usr/local/camunda/documents` as the mount path, as it will already have the right permissions for the Camunda process to read and write to it.
- **In-memory** storage can be used to store documents during the application's runtime. When the application is stopped, documents are lost.
  - It can be used with [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run), [Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose) and [Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install).
  - In-memory storage is not suitable for production use, as pods and memory are not shared across components. Files stored in memory are not persisted and will be lost on application restart.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/index
