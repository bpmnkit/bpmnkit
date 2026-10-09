# Job worker — Related resources

- [Job worker basics](https://docs.camunda.io/docs/next/components/concepts/job-workers)


## How job workers work

The Java client provides a job worker that handles polling for available jobs. This allows you to focus on writing code to handle the activated jobs.

**Caution: REST API limitation**
The Java client cannot keep the long-lived polling connections required for job polling via the Orchestration Cluster REST API in the following cases:

- Performing long-polling job activation when activating jobs larger than the [maximum message size](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway#zeebegatewaynetwork).
- Issuing any additional job activation requests while a long-polling connection is open - whether from the same client instance, another client in the same JVM, or a client in a different JVM.

When the cases above occurs, the open long-polling request will be interrupted.
You may observe workers intermittently stop receiving jobs and cause reduced throughput due to wasted I/O and connection churn.
If you encounter this issue, consider using job activation via the Orchestration Cluster REST API with long polling disabled, or switching to the Zeebe gRPC protocol for job activation.

Additionally, the long-polling connection might still receive jobs after the Java client is closed.
As the Java client does not process these jobs they will time out.
This means some jobs are not processed and will become available again after their timeout has elapsed.

On `open`, the job worker waits `pollInterval` milliseconds and then polls for `maxJobsActive` jobs. It then continues with the following schedule:

1. If a poll did not activate any jobs, it waits for `pollInterval` milliseconds and then polls for more jobs.
2. If a poll activated jobs, the worker submits each job to the job handler.
3. Every time a job is handled, the worker checks whether the number of unhandled jobs have dropped below 30% (rounded up) of `maxJobsActive`. The first time that happens, it will poll for more jobs.
4. If a poll fails with an error response, a backoff strategy is applied. This strategy waits for the delay provided by the `backoffSupplier` and polls for more jobs.

For example, imagine you have 10 process instances and a single job worker configured with `maxJobsActive = 3`. The job worker will first pull three jobs and begin executing them. The threshold to poll for new jobs is 1 (30% of 3 rounded up). After two jobs have completed, the threshold is reached and the job worker will poll for up to 2 additional jobs. This process repeats until the jobs from all 10 process instances are completed.

If streaming is enabled (via `streamEnabled`), it will also open a long-living stream over which jobs will be pushed without having to be polled. In such cases, a worker will only buffer up to `maxJobsActive` jobs at the same time. You can then estimate its memory usage as `maxJobsActive` times the max message size.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/job-worker
