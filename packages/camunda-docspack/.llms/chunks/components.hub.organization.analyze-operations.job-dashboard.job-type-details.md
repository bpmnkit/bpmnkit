# Job dashboard — Job type details

The **Job type details** page shows metrics and errors for a single job type.

![Job type details view in SaaS](img/job-activity-log.png)

### Job workload

The **Job workload** chart shows how many jobs were **created**, **completed**, and **failed** over time for the selected job type and time range. Failed counts include jobs that ended in an error state (error thrown, failed, or timed out). Canceled, migrated, or retry-update-only states are not counted.

### Job completion rate

The **Job completion rate** donut chart shows three groups for the selected time range:

- **Created**: All jobs created, regardless of whether they are still running, completed, or failed.
- **Completed**: Jobs that have finished executing successfully.
- **Failed**: Jobs that ended in an error state (error thrown, failed, or timed out). Multiple failed attempts for the same job are counted separately. Canceled or migrated jobs are not included.

Use this chart to see at a glance whether most jobs finish successfully or many end in a failed state.

### Job workers table

The **Job workers** table shows which job workers processed this job type and how many jobs they handled:

- **Worker name**
- **Created jobs**
- **Completed jobs**
- **Last completed**

Use this table to see which job workers are active and whether failures are concentrated on specific job workers.

### Failed jobs by error type

The **Failed jobs by error type** table groups failed jobs by error so you can quickly see the most common problems:

- Search by error type or message.
- Columns:
  - **Error type**
  - **Error message**
  - **Jobs with error**

Click **View errors** to open related instances in **Operate**, with the **Error Message** filter prefilled so you see only instances that failed with that error.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/analyze-operations/job-dashboard
