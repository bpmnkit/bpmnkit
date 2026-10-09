# Deploy Camunda 8 to a local kind cluster — Prerequisites

Before you begin, you'll need:

- Terminal access with administrator/sudo privileges for modifying the hosts file (`/etc/hosts`)
- A container runtime with at least 4 CPU cores and 8 GB RAM available. Allocate 12 GB or more when you set `SECONDARY_STORAGE=elasticsearch`, as the full stack then runs Elasticsearch, Keycloak, three PostgreSQL clusters, and every Camunda component:
  - [Docker Desktop](https://www.docker.com/products/docker-desktop)
  - [Docker Engine](https://docs.docker.com/engine/install/)
  - [Podman](https://podman.io/docs/installation)
- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
- [Helm CLI v4](https://helm.sh/docs/intro/install/) (recommended; see [supported versions](https://docs.camunda.io/docs/next/reference/supported-environments#clients)).
- [yq](https://github.com/mikefarah/yq#install)
- [jq](https://jqlang.org/download/)
- [envsubst](https://www.gnu.org/software/gettext/manual/html_node/envsubst-Invocation.html) (Domain mode only; part of the `gettext` package)
- [mkcert](https://github.com/FiloSottile/mkcert#installation) (Domain mode only)

**Tip**
You can also use [asdf](https://asdf-vm.com/) to install the tools, with the versions defined in [.tool-versions](https://github.com/camunda/camunda-deployment-references/blob/main/.tool-versions).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
