# Camunda components troubleshooting — DNS disruption issue for Zeebe in Kubernetes clusters (1.29-1.31)

Kubernetes clusters running versions 1.29 to 1.31 may experience DNS disruptions during complete node restarts, such as during upgrades or evictions, particularly if the cluster's DNS resolver pods are affected.

This issue is specifically noticeable for Zeebe (Netty), as it will no longer be able to form a cluster because of improper DNS responses. This occurs because Zeebe continues to communicate with a non-existent DNS resolver, caused by improper cleanup of conntrack entries for UDP connections.

Details on this issue can be found in [this Kubernetes issue](https://github.com/kubernetes/kubernetes/issues/125467) and has been resolved in the following patch releases:

- Kubernetes 1.29.10
- Kubernetes 1.30.6
- Kubernetes 1.31.2

Kubernetes versions 1.32 and versions before 1.29 are not affected.

If an immediate cluster upgrade to a fixed version is not possible, the following temporary workarounds can be applied if you encounter DNS issues:

- Restart the `kube-proxy` pod(s)
- Delete the affected Zeebe pod

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
