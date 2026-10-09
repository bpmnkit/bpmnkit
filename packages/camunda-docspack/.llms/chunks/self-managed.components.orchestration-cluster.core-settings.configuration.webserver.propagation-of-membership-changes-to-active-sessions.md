# Webserver & security — Propagation of membership changes to active sessions

When a user logs in, the Orchestration Cluster determines their associations at once (membership in roles, groups, tenants; application authorizations) and stores them into the user's active web session.
When these associations change (e.g. user is removed from a group; authorizations change), then this is not reflected in this cached state immediately but only until the next refresh interval comes.
The default interval is 30 seconds but can be configured via the `camunda.security.authentication.authentication-refresh-interval` property to a higher/lower value if needed considering a trade-off between the extra load for session refresh and the criticality of having sync authentications.
The property format is an ISO8601 duration, for example `PT10M` to set it to 10 minutes. For more information on ISO8601 duration format, refer to [ISO8601](https://en.wikipedia.org/wiki/ISO_8601#Durations).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/webserver
