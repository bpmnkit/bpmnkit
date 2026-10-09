# Install Camunda for production with Helm — Operational configuration options — Security

The following resources and configuration options are important to keep in mind regarding security:

- To limit unnecessary permissions, and reduce risk of token exploitations, it is recommended to disable auto-mounting of the default Service Account. It is possible to do so by adding the following to both of your values files:

  ```yaml
  identity:
    serviceAccount:
      enabled: false
  console:
    serviceAccount:
      enabled: false
  webModeler:
    serviceAccount:
      enabled: false
  connectors:
    serviceAccount:
      enabled: false
  orchestration:
    serviceAccount:
      enabled: false
  optimize:
    serviceAccount:
      enabled: false
  ```

**Note**
  You should only enable the auto-mounting of a service account token when the application explicitly needs access to the Kubernetes API server, or you have created a service account with the exact permissions required for the application and bound it to the pod.

- Restrict pod-to-pod traffic with [network policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/). See [required network traffic](#required-network-traffic) for the flows a Camunda installation depends on.

- Several in-cluster connections, including Connectors to the Orchestration Cluster gateway and Spring Boot management endpoints, are plaintext by default. `global.tls.caBundle` does not cover them. To encrypt them, run a service mesh such as Linkerd, Istio, or Cilium. See [in-cluster transport](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls#in-cluster-transport-service-mesh-required) for the affected connections.

- It is possible to have a pod security standard that is suited to your security constraints. This is enabled by modifying the Pod Security Admission. See the [Pod Security Admission](https://kubernetes.io/docs/concepts/security/pod-security-admission/) guide in the official Kubernetes documentation for more information.
- By default, the Camunda Helm chart is configured to use a read-only root file system for the pod. It is advisable to retain this default setting, and no modifications are required in your Helm values files.
- Disable privileged containers. This can be achieved by implementing a pod security policy. For more information, see the official [Kubernetes documentation](https://kubernetes.io/docs/concepts/security/pod-security-admission/).
- It is possible to modify either the `containerSecurityContext` or the `podSecurityContext`. The following example show the default configuration for the Orchestration Cluster:

  ```yaml
  podSecurityContext:
    runAsNonRoot: true
    fsGroup: 1001
    seccompProfile:
      type: RuntimeDefault

  containerSecurityContext:
    allowPrivilegeEscalation: false
    privileged: false
    readOnlyRootFilesystem: true
    runAsNonRoot: true
    runAsUser: 1001
    seccompProfile:
      type: RuntimeDefault
  ```

  To add any other security constraints to your Helm values files, refer to the official [Kubernetes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/).

- It is recommended to pull images exclusively from a private registry, such as [Amazon ECR](https://aws.amazon.com/ecr/), rather than directly from Docker Hub. Doing so enhances control over the images, avoids rate limits, and improves performance and reliability. Additionally, you can configure your cluster to pull images only from trusted registries. Tools like [Open Policy Agent](https://blog.openpolicyagent.org/securing-the-kubernetes-api-with-open-policy-agent-ce93af0552c3#3c6e) can be used to enforce this restriction.

- Please refer to our [installing in an air-gapped environment guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/registry-and-images/air-gapped-installation) when deploying Camunda in Air-gapped environments

- Open Policy Agent can also be used to [allowlist Ingress hostnames](https://www.openpolicyagent.org/docs/latest/kubernetes-tutorial/#4-define-a-policy-and-load-it-into-opa-via-kubernetes).

#### Required network traffic

If you enforce network policies, a default-deny posture blocks traffic Camunda depends on. Allow the following flows for a single-namespace installation. For a deployment split across namespaces, see [install the deployment topology](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index#allow-required-network-traffic).

| Direction | Source                          | Destination           | Ports                    | Purpose                                              |
| :-------- | :------------------------------ | :-------------------- | :----------------------- | :--------------------------------------------------- |
| Ingress   | Ingress controller              | Orchestration Cluster | `8080/TCP`, `26500/TCP`  | REST API, web applications, and gRPC clients         |
| Internal  | Orchestration Cluster           | Orchestration Cluster | `26501/TCP`, `26502/TCP` | Gateway-to-broker and inter-broker communication     |
| Internal  | Connectors                      | Orchestration Cluster | `8080/TCP`, `26500/TCP`  | Activate jobs and call the Orchestration Cluster API |
| Internal  | Camunda Hub                     | Orchestration Cluster | `8080/TCP`, `26500/TCP`  | Deploy processes and call the API                    |
| Internal  | Orchestration Cluster           | Management Identity   | `80/TCP`                 | Resolve users, groups, and authorizations            |
| Egress    | All Camunda pods                | Cluster DNS           | `53/TCP`, `53/UDP`       | Resolve service names                                |
| Egress    | Orchestration Cluster, Optimize | Secondary storage     | `9200/TCP` or `5432/TCP` | Elasticsearch/OpenSearch, or the RDBMS vendor port   |
| Egress    | All Camunda pods                | Identity provider     | Provider HTTPS port      | Authenticate users and clients                       |
| Egress    | Orchestration Cluster           | Document store        | Provider HTTPS port      | Store and retrieve documents                         |
| Probes    | Kubelet, Prometheus             | Orchestration Cluster | `9600/TCP`               | Readiness, liveness, and metrics                     |
| Probes    | Kubelet, Prometheus             | Camunda Hub, Optimize | `8091/TCP`, `8092/TCP`   | Readiness, liveness, and metrics                     |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
