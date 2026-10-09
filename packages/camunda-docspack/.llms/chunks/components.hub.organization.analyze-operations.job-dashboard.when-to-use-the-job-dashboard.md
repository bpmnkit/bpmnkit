# Job dashboard — When to use the job dashboard

With the job dashboard, you can:

- Check whether jobs flow through the system (created, completed, failed) for each job type.
- See which job workers process a given job type and how many jobs they handle.
- Investigate error patterns for a job type before drilling into individual process instances in Operate.
- Avoid building and maintaining custom job-monitoring dashboards.


## Open the job dashboard

### 1. Open the Jobs overview

1. In Camunda Hub, go to **Clusters**.
2. Select a cluster.
3. On the **Overview** tab, locate the **Jobs** card.
4. Click **View jobs** to open the **Job types** page.

### 2. Job types overview

The **Job types** page shows all job types running against the selected cluster.

![Jobs overview with Job types table](img/jobs-overview.png)

Key elements:

- **Last updated** timestamp (based on statistics responses).
- **Search** box to filter job types.
- **Time range** selector (for example, **Last 24 hours**) that controls all metrics on the page.
- Table columns:
  - **Job type**
  - **Assigned workers**
  - **Created jobs**
  - **Completed jobs**
  - **Not completed jobs**
  - **Last completed**

If the selected date range hits internal limits, Camunda Hub shows a warning that not all data is displayed. Narrow the time range to see a more complete view.

Job metrics are stored internally in the engine and exported in batches every five minutes. As a result, metrics in the UI can be delayed by up to five minutes.

Configuration limits protect the system and include:

- Maximum string lengths for job type, job worker, and tenant ID
- Maximum number of unique keys (jobType × tenantId × job worker combinations)

If a limit is exceeded, the batch is marked as incomplete, and the UI shows the **Data loading limit reached** warning.

In this case:

- Narrow the time range to reduce the amount of data
- Filter by job type to focus on a smaller subset
- In Self-Managed environments, adjust configuration limits if needed

Treat the counts as partial for the affected time range.

To drill down into a specific job type, click its **Job type** link (for example, `send-email`).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/analyze-operations/job-dashboard
