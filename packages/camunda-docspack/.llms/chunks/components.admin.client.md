# Clients

Learn how to configure and manage client access to an orchestration cluster.

Configure and manage client access to a cluster so the client application has the permissions it requires.


## About client application access

A client is an application that interacts with an Orchestration Cluster via its APIs. For example, an [external agent](https://docs.camunda.io/docs/next/reference/glossary#external-agent)'s runtime can be configured as a client so it can call the [Agent Instance API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-agent-instance.api) to report its execution.

This guide describes how to manage client access in SaaS and in Self-Managed environments that use an [external OpenID Connect (OIDC) identity provider](https://docs.camunda.io/docs/next/components/concepts/access-control/connect-to-identity-provider) for authentication.

If you are using the Orchestration Cluster with [Basic authentication](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-orchestration-cluster#basic-authentication), both end users and machine-to-machine (m2m) applications are treated as users and must be [managed accordingly](https://docs.camunda.io/docs/next/components/admin/user). The Admin UI does not display dedicated client options in Basic authentication setups for this reason.

---
Source: https://docs.camunda.io/docs/next/components/admin/client
