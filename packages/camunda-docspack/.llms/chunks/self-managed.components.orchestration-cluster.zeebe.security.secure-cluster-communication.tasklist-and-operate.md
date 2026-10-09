# Secure cluster communication — Tasklist and Operate

Using the same set of configuration properties, you can configure Tasklist and Operate to enable TLS-secured connectivity within a Camunda 8 cluster. Refer to the documentation on [Tasklist configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/tasklist/tasklist-configuration#intra-cluster-secure-connection) and [Operate configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/operate/operate-configuration#intra-cluster-secure-connection) for additional details.


## How it works

When enabled for each node, communication over TCP between these is securely encrypted using the provided certificates in a client-server model.

For example, let's take two nodes (`A` and `B`). When `A` (the client) sends a request to `B` (the server), they perform a TLS handshake, wherein `B`'s certificate is exchanged and verified by `A`. Afterwards, the request is encrypted such that only a node with `B`'s private key may decrypt it (i.e. in this instance, `B`).

When the roles are reversed (e.g. `B` sends a request to `A`), the same handshake occurs, but the other way around. As`B` is now the client, and `A` the server, `A`'s certificate is exchanged and verified by `B`. Afterwards, all communication is encrypted and can only be decrypted with `A`'s private key.

**Note**

In this model, only the client verifies the identity of the server, as opposed to mTLS, in which both client and server exchange and verify one another's identities. If you need mTLS, it's currently recommended to explore a solution which provides this transparently like a service mesh (e.g. Linkerd or Istio).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-cluster-communication
