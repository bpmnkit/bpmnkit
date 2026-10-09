# Bring your own groups — Limitations and behavior

- Self-Managed only. The feature is not available in Camunda 8 SaaS.
- No group sync or listing. Groups exist only at the moment a token is evaluated. They are not persisted in Camunda and are not browsable in the Identity UI or the REST API.
- REST group management is disabled while the claim is set. When `groups-claim` is set, the `/v2/groups/**` endpoints return HTTP 404. This is a hard switch, not a merge — you cannot manage some groups via REST and others via the claim at the same time.
- Per-token evaluation. Group membership is re-read from every token. Changes in your IdP take effect on the next sign-in or token refresh; they do not propagate to already-active sessions.
- Array shape required. The claim value must always be a JSON array, even for users who belong to a single group.
- Clients use the same claim. Machine-to-machine tokens resolve their groups through the same `groups-claim` configuration as user tokens.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/bring-your-groups
