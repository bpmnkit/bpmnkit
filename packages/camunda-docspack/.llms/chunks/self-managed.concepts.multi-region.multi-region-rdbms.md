# Multi-Region RDBMS

Multi-Region RDBMS spreads an Orchestration Cluster across two or more regions and delegates secondary storage replication to the database. With three or more regions, a region loss leaves the Raft quorum intact.

Multi-Region RDBMS spreads a single Orchestration Cluster across two or more regions. It uses a relational database as its secondary storage, and leaves replication to that database. You need three or more regions to keep processing through a region loss. Every partition then keeps a majority when one region disappears, as long as no region holds half the replicas of a partition or more. The engine keeps processing instead of stopping for an operator.

**Caution: Before you begin**
Running a multi-region setup requires you to develop, test, and execute [operational procedures](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops) specific to your environment. Review the [limitations](#limitations) and [requirements](#requirements) before you commit to this configuration.

To have your multi-region setup covered by Camunda enterprise support, get your configuration and runbooks reviewed by Camunda before going to production. Contact your Customer Success Manager as soon as you plan your multi-region setup.

That review covers the architecture you build. It does not make the [reference implementation](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms) a supported product. That repository is explicitly experimental. It is meant for learning, evaluation, and design review, and is not production-ready as published.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms
