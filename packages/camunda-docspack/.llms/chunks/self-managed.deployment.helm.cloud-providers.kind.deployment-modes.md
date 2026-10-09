# Deploy Camunda 8 to a local kind cluster — Deployment modes

You can choose from two deployment modes:

| Mode          | Access                        | Requirements                    | Use case                              |
| ------------- | ----------------------------- | ------------------------------- | ------------------------------------- |
| **Domain**    | `https://camunda.example.com` | mkcert, hosts file modification | Full TLS setup, realistic environment |
| **No-domain** | `localhost` via port-forward  | hosts file modification         | Quick setup, minimal configuration    |

### How domain mode works

In domain mode, you'll simulate a production-like environment locally with:

- **Local DNS resolution**
  - You'll configure your machine's `/etc/hosts` file to resolve `camunda.example.com` to `127.0.0.1`.
  - Inside the cluster, you'll configure CoreDNS to rewrite DNS queries for this domain to the Ingress controller, allowing pods to communicate with each other using the same domain name.
- **TLS certificates with mkcert**
  - You'll use [mkcert](https://github.com/FiloSottile/mkcert) to generate locally-trusted certificates by installing a local Certificate Authority (CA) in your system's trust store. This allows your browser to trust the self-signed certificates without security warnings.
  - You'll also mount the CA certificate in the pods that need to make HTTPS calls to other Camunda components.

**Note: Firefox compatibility**
mkcert requires [NSS](https://github.com/FiloSottile/mkcert#supported-root-stores) to work properly with Firefox. Without it, Firefox will display certificate errors. We recommend using **Chrome** or **Chromium-based browsers** for the best experience with domain mode.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
