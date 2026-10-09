# Resolve incidents and update variables — Diagnosing and resolving incidents

Operate provides tools for diagnosing and resolving incidents. Let’s go through incident diagnosis and resolution step by step.

When we inspect the process instance, we can observe exactly what our incident is:

1. Click the **Process Instance Key** for the process stuck on the **Order Value?** node.
2. Navigate to the **Incidents** tab in the bottom panel.
3. Observe the error message:

```text
Expected result of the expression 'orderValue >= 100' to be 'BOOLEAN', but was 'NULL'. The evaluation reported the following warnings:
[NOT_COMPARABLE] Can't compare '"99"' with '100'
```

To resolve this incident, we must edit the `orderValue` variable so it’s an integer. To do so, take the following steps:

1. Under **Variables**, click the edit icon next to the `orderValue` variable.
2. Edit the variable by removing the quotation marks.
3. Click the checkmark icon to save the change.

We were able to solve this particular problem by **editing** a variable, but it’s worth noting you can also **add** a variable if a variable is missing from a process instance altogether.

Lastly, initiate a "retry" of the process instance by selecting **Retry** in the top right corner of the page.

You should now see the incident has been resolved, and the process instance has progressed to the next step.

**Note**
Selecting **Retry** marks the incident as resolved and triggers a retry. It does not verify that the underlying cause has been fixed.

For a [job incident](https://docs.camunda.io/docs/next/components/concepts/incidents#resolving), Camunda checks the problem again only when a worker next activates the job. If no worker is connected for the job type, the incident does not reappear even if the cause is still present. As a result, the process instance can appear healthy in Operate even though the problem remains unresolved.

Keep a worker connected for the affected job type so Camunda can raise a new incident promptly if the cause remains unresolved.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/resolve-incidents-update-variables
