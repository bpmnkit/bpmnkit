# Orchestration Cluster authentication in Self-Managed

Learn about authentication methods for the Orchestration Cluster on Self-Managed and how to choose the right one for your environment.

Authentication to the Orchestration Cluster components and their resources is managed by [Admin](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview).


## About Orchestration Cluster authentication

Orchestration Cluster authentication includes components such as [Zeebe](https://docs.camunda.io/docs/next/components/zeebe/zeebe-overview), [Admin](https://docs.camunda.io/docs/next/components/admin/admin-introduction), [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction), [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/introduction-to-tasklist), and the [Orchestration Cluster API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).

The Orchestration Cluster supports two authentication methods:

- [Basic authentication](#basic-authentication)
- [OIDC](#oidc)

### Comparison of authentication methods

|                          | **API access**        | **Web UI access**     | **User management**            |
| ------------------------ | --------------------- | --------------------- | ------------------------------ |
| **Basic authentication** | Username and password | Username and password | Via Admin                      |
| **OIDC**                 | OAuth 2.0 (via IdP)   | OIDC (via IdP)        | Via External Identity Provider |

Additionally, an [Unprotected API mode](#unprotected-api-mode) is available for development purposes, which can be applied to either method.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-orchestration-cluster
