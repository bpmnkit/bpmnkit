# Bring your own groups — Troubleshooting

If groups from your IdP are not being applied in Camunda, check the following:

- The claim is present in the issued token. Decode an ID or access token for a user who should have the groups and verify the claim appears with the expected array value. Your IdP may require explicit scope or claim-mapping configuration to include it.
- JSONPath matches the actual structure. If your groups claim is nested, make sure the JSONPath expression in `groups-claim` resolves to the array itself, not its parent object.
- Group IDs match exactly. Camunda matches group IDs as literal strings. A trailing space, different case, or stray prefix will cause Camunda-side assignments to silently miss.

For deeper investigation, see [debugging authentication](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/debugging-authentication).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/bring-your-groups
