# Configure the Helm chart with Gateway API — Prerequisites

Ensure the following are installed in your cluster before enabling the Gateway API in the Helm chart:

- Gateway API CRDs
- A Gateway API controller

See the [list of Gateway API implementations](https://gateway-api.sigs.k8s.io/implementations/) for available controllers. In testing, we use the [NGINX Gateway Fabric](https://github.com/nginx/nginx-gateway-fabric).


## Deployment scenarios

Choose the scenario that matches your cluster setup.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/gateway-api-setup
