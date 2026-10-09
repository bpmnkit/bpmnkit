# Client authorization — Client

Zeebe clients also provide a way for users to modify request headers, namely to contain access tokens.

Users can modify request headers using Zeebe's built-in `OAuthCredentialsProvider`, which uses user-specified credentials to contact an OAuth authorization server. The authorization server should return an access token that is then appended to each request.

Although, by default `OAuthCredentialsProvider` is configured with to use a Camunda 8 authorization server, it can be configured to use any user-defined server. Users can also write a custom [CredentialsProvider](https://github.com/camunda/camunda/blob/main/clients/java/src/main/java/io/camunda/client/CredentialsProvider.java). In the following sections, we'll describe the usage of the default `OAuthCredentialsProvider` as well as the `CredentialsProvider` interface that can be extended for implementing a custom provider.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/client-authorization
