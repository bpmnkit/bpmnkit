# Storage isolation — Amazon OpenSearch Service storage

When secondary storage runs on Amazon OpenSearch Service, each physical tenant can authenticate with its own credentials. The connection settings `url`, `username`, `password`, and `index-prefix` are all overridable per physical tenant, supporting either a shared OpenSearch instance or a dedicated OpenSearch instance per tenant.

### Basic authentication with fine-grained access control

Enable [fine-grained access control](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/fgac.html) (FGAC) with the internal user database on the domain, then create one internal user per tenant and map it to an OpenSearch security role whose index permissions are restricted to that tenant's index pattern. All permission administration happens on the AWS side; Camunda only supplies the per-tenant credentials:

```yaml
camunda:
  data:
    secondary-storage:
      type: opensearch
      opensearch:
        url: https://my-domain.eu-central-1.es.amazonaws.com
        username: camunda-default
        password: default-secret
        index-prefix: default
  physical-tenants:
    tenanta:
      data:
        secondary-storage:
          opensearch:
            username: tenant-a-user
            password: tenant-a-secret
            index-prefix: tenant-a
```

A tenant can also point at a dedicated OpenSearch instance (including one in a different AWS account) by overriding `url` as well:

```yaml
camunda:
  physical-tenants:
    tenanta:
      data:
        secondary-storage:
          opensearch:
            url: https://tenant-a-domain.eu-central-1.es.amazonaws.com
            username: tenant-a-user
            password: tenant-a-secret
            index-prefix: tenant-a
```

### IAM authentication (request signing)

Alternatively, set `aws-enabled: true` to sign requests with AWS Signature Version 4 instead of Basic authentication. Credentials are resolved from the AWS SDK default provider chain. On EKS this is the pod's IAM role via IRSA, and the region is taken from the environment (for example, `AWS_REGION`):

```yaml
camunda:
  data:
    secondary-storage:
      type: opensearch
      opensearch:
        url: https://my-domain.eu-central-1.es.amazonaws.com
        aws-enabled: true
```

With request signing, the AWS identity is also the principal that OpenSearch authorizes: all physical tenants share the pod's single IAM role, and tenant separation is provided by per-tenant index prefixes together with the instance's access policy or FGAC role mapping for that role. Per-tenant IAM identities are not supported; if tenants require authentication isolation from each other, use fine-grained access control with per-tenant internal users as described above.

IAM authentication also works with a dedicated OpenSearch instance per tenant. Camunda creates a separate client per tenant, each signing requests against its own endpoint with the same pod identity. `aws-enabled` is inherited from the root configuration, so tenants only override their `url`:

```yaml
camunda:
  data:
    secondary-storage:
      type: opensearch
      opensearch:
        url: https://default-instance.eu-central-1.es.amazonaws.com
        aws-enabled: true
        index-prefix: default
  physical-tenants:
    tenanta:
      data:
        secondary-storage:
          opensearch:
            url: https://tenant-a-instance.eu-central-1.es.amazonaws.com
            index-prefix: tenant-a
    tenantb:
      data:
        secondary-storage:
          opensearch:
            url: https://tenant-b-instance.eu-central-1.es.amazonaws.com
            index-prefix: tenant-b
```

For this to authenticate correctly, two conditions must hold:

- **Every instance must authorize the pod's IAM role**: attach an IAM policy to the role allowing `es:ESHttp*` on each instance's ARN, and allow the role in each instance's access policy (or map the role ARN in its fine-grained access control configuration). This also works for an instance in a different AWS account, granted through that instance's resource-based access policy. The signing identity is still the single pod role.
**Warning**
  **All instances must be in the same AWS region as the pod.** The request signature is scoped to the region resolved from the pod's environment (for example `AWS_REGION`), not derived from each endpoint. An instance in a different region rejects the signature with an authentication error.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
