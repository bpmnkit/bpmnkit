# Notification rules — Rule structure

A rule triggers a notification only when a user task matches all configured filters.

| Field              | Required | Description                                                                                                                                                                                                                                                                                                  |
| :----------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization       | Yes      | The Camunda organization the rule applies to. Auto-selected if you only have access to one.                                                                                                                                                                                                                  |
| Cluster            | Yes      | The cluster within the organization. Auto-selected if only one cluster is available. On a Self-Managed deployment with [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/app-integrations), each cluster and tenant pair is listed as its own entry, and the rule is bound to the pair you pick. |
| Process definition | No       | Limit the rule to user tasks from a single process. Leave empty (**All processes (no filter)**) to match user tasks from every process in the cluster. On Slack, this is a typeahead field.                                                                                                                  |
| User tasks         | No       | One or more specific user task elements within the selected process. Pick them visually on the BPMN diagram on Microsoft Teams. Only available after you select a process. Leave empty to match all user tasks. On Slack, this is a multi-select, capped at 100 options.                                     |
| Candidate users    | No       | Comma-separated list of user identifiers. Matches tasks assigned to any of these users.                                                                                                                                                                                                                      |
| Candidate groups   | No       | Comma-separated list of group identifiers. Matches tasks assigned to any of these groups.                                                                                                                                                                                                                    |

### Match semantics

- Empty filters match all user tasks in the selected cluster. A rule with no filters matches every user task in the selected cluster: the broadest possible subscription.
- Adding filters narrows the match. Filters combine with AND across fields and OR within each list. For example, a rule with `candidateGroups = "finance, hr"` and a selected process matches tasks from that process that have either `finance` or `hr` as a candidate group.
- Multiple matching rules deduplicate. If several rules match the same user task event, the recipient still receives only one notification per event.
- The cluster and Physical Tenant are matched exactly and cannot be left empty. A rule created for one Physical Tenant never receives another tenant's user tasks, so a cluster split into Physical Tenants needs its rules recreated per tenant.

**Tip**
Start broad and narrow down. If you are not sure which filters you need, create a rule with no filters first, observe the notifications you receive, and then refine.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/notification-rules
