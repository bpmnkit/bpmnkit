# Health

This document explains how health is defined in a Zeebe cluster.

Health in Zeebe is not a binary status, but can have three different states:

- **Healthy**: everything is working as expected.
- **Unhealthy**: at least parts of the system are in a degraded state.
- **Dead**: one or more parts of the cluster experienced non-recoverable failure.


## Unhealthy

When a node in a Zeebe cluster is unhealthy, it means parts of the system may not work. This is often a transient state. For example, when a node is starting, it starts in an unhealthy state, as several components, such as a partition and the workflow engine, are not yet installed or ready for operation.

When this is temporary, and the cluster overall converges to a steady healthy state, you can safely ignore these temporary signals. However, if things persist, or if you see the cluster alternate between healthy and unhealthy, it can be an indicator of an underlying issue that requires investigation.

**Note**
Note that even if parts of the cluster are unhealthy, it can be that other parts are still working fine.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/health
