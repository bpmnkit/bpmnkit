# SaaS clusters — Recovery objectives by outage type — Cloud provider or third-party service outage

An outage at Camunda's cloud provider, network and edge providers, or other third-party services can make clusters unreachable, or prevent Camunda from starting or replacing infrastructure, until the provider recovers. Camunda SaaS clusters run on a single cloud provider and can't fail over to another provider.

This differs from a region failure. If an outage affects only your cluster's region and your secondary backups region is still available, you can recover through cross-region cold recovery. If the outage also affects the secondary backups region, or prevents Camunda from creating infrastructure there, the cluster stays unavailable until the provider recovers.

**RTO/RPO assessment:** Clusters stay unavailable until the provider recovers, so Camunda doesn't set an RTO or RPO for this type of outage. Camunda follows its incident response process and publishes updates on the [Camunda status page](https://docs.camunda.io/docs/next/components/saas/status).

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters
