# Configure registry and images — Pull images from a private registry

To pull images from a private registry, store your registry credentials in a Kubernetes Secret and add the Secret to your Helm values.

1. Create a `docker-registry` Secret in the namespace where you install the chart. Pods can only use pull secrets from their own namespace.

   ```shell
   kubectl create secret docker-registry registry-credentials \
     --docker-server=example.jfrog.io \
     --docker-username=<username> \
     --docker-password=<password> \
     --namespace <namespace>
   ```

1. Set your registry and the Secret in `global.image`:

   ```yaml
   global:
     image:
       registry: example.jfrog.io
       pullSecrets:
         - name: registry-credentials
   ```

1. (Optional) Set the `image` values of a component to use a different registry or Secret for that component:

   ```yaml
   connectors:
     image:
       registry: other.example.com
       pullSecrets:
         - name: connectors-registry-credentials
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/registry-and-images/index
