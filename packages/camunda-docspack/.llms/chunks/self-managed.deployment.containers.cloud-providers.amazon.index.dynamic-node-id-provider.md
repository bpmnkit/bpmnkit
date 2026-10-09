# Amazon ECS — Dynamic node ID provider

Camunda 8 is designed for Kubernetes StatefulSet deployments where each broker manages data on dedicated disk storage. Amazon ECS presents a challenge, as tasks are stateless by design and typically rely on external databases for state management.

To deploy Camunda 8 to Amazon ECS, we introduce a dynamic node ID provider service backed by Amazon S3. This service enables each ECS task to assume the role of a Camunda 8 broker and safely manage the corresponding data in a dedicated directory on a shared EFS disk.

The node ID provider operates using a lease mechanism stored in Amazon S3. A task acquires a broker role when it obtains the lease for a specific node ID. If the lease cannot be renewed, the task shuts down immediately to maintain data integrity.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/index
