# Metadata filters — Assignee and candidate group filters

These filters allow you to include or exclude instances based on the assignee or the candidate group of at least one user task of a particular process instance.

![Assignee/Candidate group filter modal](./img/assignee-filter.png)

As shown in the example, it is possible to select one or more assignees or even filter for unassigned instances.

This filter has different behavior depending on where it was [defined](https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/filters#filter-behavior):

- As a `Flow Node data filter` applied on a user task report: This filter only includes user task instances that satisfy _all_ assignee/candidateGroup filters defined in the report at once. Mutually exclusive filters like having both an inclusive and an exclusive filter on the same assignee do not yield any results in user task reports.

- As an `instance filter`: This filter includes all process instances where _at least one_ user task satisfies one particular assignee/candidateGroup criterion. This means multiple mutually exclusive assignee/candidateGroup filter entries might still yield results for these reports (e.g. if the process definition contains multiple user tasks).

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/metadata-filters
