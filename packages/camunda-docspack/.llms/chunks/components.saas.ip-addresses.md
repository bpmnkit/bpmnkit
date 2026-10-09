# Hostnames and IP addresses for Camunda connections

Details on the network configuration for Camunda 8 SaaS clusters.

Camunda 8 SaaS only

Camunda 8 SaaS hostnames and IP addresses for inbound and outbound connections.


## Static outbound IP addresses

Camunda SaaS uses static IP addresses for some of its services. These addresses can be retrieved using the [Camunda Management API `/meta/ip-ranges` endpoint](https://console.cloud.camunda.io/customer-api/openapi/docs/#/default/GetMeta).

Although changes to these IP addresses are infrequent, they may occur from time to time. Any change will be published through the API at least 24 hours in advance. If you rely on these IP addresses for your network configuration, it is strongly recommended fetching the latest version at least once every 24 hours.

**Note**

Typically, any changes to these IP addresses are communicated in advance. However, in exceptional cases, it may not be possible to provide prior notice.

---
Source: https://docs.camunda.io/docs/next/components/saas/ip-addresses
