# Job dashboard — Empty states and access restrictions

### No jobs in the queue

If there are no jobs for the cluster or selected time range, the Jobs page shows:

- Heading: **No jobs in the queue**
- Message: **No jobs found.**
- Link: **Learn more about Jobs and Job Workers**

This means there is no job activity to display.

### Jobs card access restricted

If the feature is disabled for the cluster or you don't have permission, the **Jobs** card on the cluster overview shows:

- Status: **Access restricted**
- Message explaining that the feature is restricted or disabled and you must contact an administrator.
- Link: **Learn more about roles and restrictions**

### Missing permissions when viewing errors

If you click **View errors** but lack permissions in Operate, you may see messages like:

- **Missing permissions to view the Definition**
- **Missing permissions to access Instance History**
- **Missing permissions to access Variables**

In this case, contact your organization owner or admin to request the necessary Operate permissions.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/analyze-operations/job-dashboard
