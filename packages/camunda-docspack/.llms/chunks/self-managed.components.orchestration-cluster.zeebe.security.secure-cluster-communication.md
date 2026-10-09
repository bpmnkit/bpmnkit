# Secure cluster communication

**Note**

TLS between nodes in the same cluster is disabled by default.

Zeebe supports transport layer security (TLS v1.3) between all nodes in a Zeebe cluster. This means it's possible to encrypt all TCP traffic between all nodes of a given cluster.

Enabling TLS for cluster communication is an all or nothing feature: either all nodes are configured to use TLS, or none are. It's not currently possible to only configure some nodes to enable TLS.

Additionally, a small portion of Zeebe traffic is done over UDP, which is left unencrypted. This is purely used for the nodes to gossip topology information amongst themselves, and no sensitive or user-given data is transmitted this way.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-cluster-communication
