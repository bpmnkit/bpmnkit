# Helm chart without Ingress setup

Accessing Camunda 8 components externally without Ingress

By default, the [Camunda Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install) does not expose the Camunda services externally. So to interact with the Camunda services inside a Kubernetes cluster without Ingress setup, you can use `kubectl port-forward` to route traffic from your local machine to the cluster. This is useful for quick tests or for development purposes.

**Note**
You need to keep `port-forward` running all the time to communicate with the remote cluster.


## Accessing workflow engine

To interact with Camunda workflow engine via [Zeebe Gateway](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway) using a local client/worker from outside the Kubernetes cluster, run `kubectl port-forward` to the Zeebe cluster as follows:

```
# gRPC
kubectl port-forward svc/camunda-zeebe-gateway 26500:26500

# REST API
kubectl port-forward svc/camunda-zeebe-gateway 8080:8080
```

Now, you can connect and execute operations against your new Zeebe cluster. Port `26500` provides gRPC access, and port `8080` provides [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) access.

**Note**
Accessing the Zeebe cluster directly using `kubectl port-forward` is recommended for development purposes.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/accessing-components-without-ingress
