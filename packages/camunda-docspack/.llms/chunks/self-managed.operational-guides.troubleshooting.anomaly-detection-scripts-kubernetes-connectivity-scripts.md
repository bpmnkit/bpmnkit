# Camunda components troubleshooting — Anomaly detection scripts — Kubernetes connectivity scripts

These scripts enable you to verify the connectivity and configuration of your Kubernetes cluster, including checks for deployment status, service availability, and Ingress configuration.

#### Kubernetes permissions

When utilizing the anomaly detection scripts within a Kubernetes environment, ensure the user has specific permissions:

- **List pods**: Required for `kubectl get pods` to fetch pod details in the namespace.
- **Execute commands in pods**: Necessary for running commands inside pods via `kubectl exec`.
- **List services**: Needed for `kubectl get services` to retrieve service information.
- **List ingresses**: Required by `kubectl get ingress` to obtain Ingress objects.
- **Get Ingress details**: Necessary for `kubectl get ingress` to fetch Ingress configurations.

#### Deployment check (`./checks/kube/deployment.sh`)

This script checks the status of a Helm deployment in the specified namespace, ensuring that all required containers are present and ready. You can customize the list of containers to check based on your deployment topology.

```bash
./checks/kube/deployment.sh -n camunda-primary -d camunda -c "zeebe,zeebe-gateway,web-modeler"
```

#### Connectivity check (`./checks/kube/connectivity.sh`)

This script verifies Kubernetes connectivity and associated configuration, checking for the presence of services and ingresses that conform to the required specifications.

```bash
./checks/kube/connectivity.sh -n camunda-primary
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
