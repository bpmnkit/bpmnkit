# Data locations — REST connector (traffic routing)

For security reasons, REST API requests made by the [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest) are all routed through a dedicated HTTPS proxy hosted by Camunda in the EU. The REST connector uses either an AWS or a GCP-hosted HTTPS proxy, depending on your chosen Orchestration Cluster cloud provider.

As a customer, you can either use the Camunda‑hosted REST connector, or [host your own connector runtime](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/host-custom-connector) (hybrid mode) to keep traffic in your chosen location.

| Host location                                                                   | Data handled                                                                                                                                                                                                    | Personal data processing                                                                                                  |
| :------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| Belgium, EU (GCP clusters)Germany, EU (AWS clusters) | All data uploaded to Camunda in an Orchestration Cluster and processed specifically by the REST API Connector.Use of the REST API Connector is optional, and depends on the customers’ workflows. | Dependent on the data you send to Camunda in an Orchestration Cluster. Camunda does not process personal data by default. |

**Note: optional**
Use of the REST connector is optional. This information only applies if you use the REST connector.

---
Source: https://docs.camunda.io/docs/next/components/saas/data-locations
