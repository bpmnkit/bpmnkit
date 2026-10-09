# Get familiar with Operate — Business ID for decision instances

Starting in 8.10, a [business ID](https://docs.camunda.io/docs/next/components/concepts/process-instance-creation#business-id) is shown for decision instances in Operate: as an optional filter field in the **Decisions** list, and in the header of a decision instance's details page, if one is defined for that instance. Filter decision instances by business ID the same way as [process instances](https://docs.camunda.io/docs/next/components/operate/userguide/filter-process-instances#business-id-filter) — using **Equals**, **Contains**, and **Is one of** in the filter UI, or the `$eq`/`$neq`/`$exists`/`$like`/`$in`/`$notIn` operators via the [search decision instances API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-decision-instances.api).

Decision instances evaluated before 8.10 do not carry a business ID, since the value is snapshotted from the owning process instance at the decision instance's own creation time. Standalone decision evaluations, which are not tied to a process instance, never carry a business ID.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/basic-operate-navigation
