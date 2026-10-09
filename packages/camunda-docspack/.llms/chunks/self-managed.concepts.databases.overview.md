# Overview

Learn how Camunda uses document and relational databases for secondary storage, including supported options, limitations, and where to find configuration details.

Camunda applications depend on a secondary storage backend to read workflow and decision data exported from the Zeebe engine.

This storage layer can use either a document-store backend or a relational database (RDBMS), depending on your requirements.

For an architectural explanation of how secondary storage fits into Camunda 8, see the  
[secondary storage overview](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index).


## App database support

| App                   | RDBMS | Non-SQL |
| --------------------- | ----- | ------- |
| Orchestration Cluster | Yes   | Yes     |
| Optimize              | No    | Yes     |
| Camunda Hub           | Yes   | No      |
| Management Identity   | Yes   | No      |

Use this matrix as a compatibility summary for the main Camunda components and their supported database backends.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/overview
