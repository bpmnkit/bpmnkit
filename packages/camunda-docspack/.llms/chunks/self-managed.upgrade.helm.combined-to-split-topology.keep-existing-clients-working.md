# Move from a combined release to the split topology — Keep existing clients working

Step 1 has the cluster record reuse the client IDs and audiences the release already uses, so its existing clients keep working. Use different client IDs and audiences in the record only if you must, for example because another record already uses the chart defaults: the chart rejects a client ID or audience that two records share. In that case, the cluster must keep accepting the old audience.

With Keycloak, clients that the release's own Management Identity created, such as the Connectors client, request tokens with the audience that Management Identity assigned, `orchestration-api` by default. After step 2, the Orchestration Cluster accepts only the audiences it's configured with.

If the release doesn't accept the old audience, Connectors can't authenticate to the Orchestration Cluster and never becomes ready. Its log shows:

```text
io.grpc.StatusRuntimeException: UNAUTHENTICATED: Invalid bearer token
```

On the 8.8 and 8.9 charts, add the old audience in the same `helm upgrade` that converts the release:

```yaml
orchestration:
  security:
    authentication:
      oidc:
        backwardsCompatibleAudiences:
          - orchestration-api
```

On the 8.10 chart, `backwardsCompatibleAudiences` is deprecated. List the old audience with the full default set in `camunda.security.authentication.oidc.audiences`. See [backwards-compatible audiences replace the audience list](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100#backwards-compatible-audiences-replace-the-audience-list).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
