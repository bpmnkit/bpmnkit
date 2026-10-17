# Hostnames and IP addresses for Camunda connections — Inbound connections

When you [create a cluster](https://docs.camunda.io/docs/next/components/saas/clusters/create-cluster) in Camunda 8 SaaS, you will receive a set of hostnames for connecting to the different cluster components.

The public IP addresses exposed for connecting to the cluster depends on the cloud provider and [region](https://docs.camunda.io/docs/next/components/saas/regions) the cluster was created in.

- **Amazon Web Services (AWS)**: Each endpoint is served by multiple IP addresses.
- **Google Cloud Platform (GCP)**: IP addresses are AnyCast IP addresses and are globally available.


## Outbound connections

If you use a [Camunda connector](https://docs.camunda.io/docs/next/components/connectors/introduction), your cluster sends requests from the Camunda SaaS infrastructure to the external services you configure in your processes.

Depending on the cloud provider, [region](https://docs.camunda.io/docs/next/components/saas/regions), and type of configured connector, connections are made from different IP addresses.

To ensure the security of incoming connector connections, you can:

- Authenticate the requests made by the Camunda connector(s). For example, see [REST connector authentication](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#authentication).
- Run the connectors into your own infrastructure and remove incoming calls from the Camunda infrastructure to your own services. For example, see [Self-Managed connectors](https://docs.camunda.io/docs/next/self-managed/components/connectors/overview).

---
Source: https://docs.camunda.io/docs/next/components/saas/ip-addresses
