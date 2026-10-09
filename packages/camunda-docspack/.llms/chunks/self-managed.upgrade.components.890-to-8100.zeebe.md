# Upgrade Camunda components from 8.9 to 8.10 — Zeebe

### Job leasing during the rolling upgrade

Camunda 8.10 introduces [job leasing](https://docs.camunda.io/docs/next/components/concepts/job-workers#job-leasing).
During a rolling upgrade from 8.9, jobs on partitions that are still running 8.9 return a `null` `jobLeaseToken`, even when activated with `withLease` set to `true`, because 8.9 brokers do not support job leasing.

If your worker requires the lease to process a job safely, treat a `null` `jobLeaseToken` as not yet supported on that partition: fail the job with a retry backoff, and set retries back to the job's current value so the fail doesn't burn through them while the upgrade is in progress.
The lease becomes available after that job's partition leader is upgraded to 8.10, and the retry converges.

When using the REST API, a gateway instance still running 8.9 rejects the unknown `withLease` field with a `400` error instead of returning `null`. This handling is no longer required after every gateway in the cluster has been upgraded to 8.10.

```java
final JobHandler paymentJobHandler =
    (jobClient, job) -> {
        final String jobLeaseToken = job.getJobLeaseToken();

        if (jobLeaseToken == null) {
            // This partition hasn't upgraded to 8.10 yet. Fail with retries
            // preserved so the job converges once the upgrade completes,
            // instead of being burned into an incident.
            jobClient
                .newFailCommand(job)
                .retries(job.getRetries())
                .retryBackoff(Duration.ofSeconds(30))
                .errorMessage("Lease required but not returned; retrying until the partition upgrades to 8.10")
                .send();
            return;
        }

        // process the job

        jobClient.newCompleteCommand(job).send();
    };

client
    .newWorker()
    .jobType("process-payment")
    .handler(paymentJobHandler)
    .withLease(true)
    .open();
```

### Deleting a process definition with running instances defers history deletion

The [delete resource](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/delete-resource.api) endpoint now accepts process definition deletion when the definition still has running instances. Instead of rejecting the request or waiting for physical removal, the definition [drains](https://docs.camunda.io/docs/next/components/concepts/resource-deletion#draining): new instances are blocked immediately, running instances continue to completion, and the definition is removed automatically afterwards.

As a result, when `deleteHistory` is `true`, the `batchOperation` field in the delete response is `null` for such a definition. Its history is removed as part of the draining lifecycle rather than through an immediately-returned batch operation.

**Action:** If any caller reads `batchOperation` from the delete response to track history deletion, handle a `null` value. Observe the definition's `DRAINING` state through the [process definition API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-process-definition.api) or the `zeebe_process_definitions_draining_count` [metric](https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics) instead.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
