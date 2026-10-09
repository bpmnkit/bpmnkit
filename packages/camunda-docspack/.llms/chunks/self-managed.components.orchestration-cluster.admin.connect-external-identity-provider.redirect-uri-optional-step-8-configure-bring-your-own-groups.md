# Connect Admin to an identity provider — Redirect URI — (Optional) Step 8: Configure bring your own groups

You can manage groups in the Orchestration Cluster or bring groups that you have already configured in your IdP. For the latter, proceed as follows:

1. Configure your IdP to include a groups claim in the token (for example, `groups` or `roles`). The value should be an array of Strings where each entry is the ID of a group.
1. Set the `groups-claim` property in your Camunda configuration to match the claim name. Similar to the `username-claim`, you can use a [JSONPath expression](https://www.rfc-editor.org/rfc/rfc9535.html) to locate the groups claim in the token (for example, `$['camundaorg']['groups']`).

You can then use these groups for role and authorization assignment, and tenant assignment.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
