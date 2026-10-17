# Glossary — J

### Job

A job represents a distinct unit of work within a [business process](#process). Service tasks represent such
jobs in your process and are identified by a unique id. A job has a type to allow specific job
workers to find jobs that they can work on.

- [Job workers](https://docs.camunda.io/docs/next/components/concepts/job-workers)

### Job activation timeout

This is the amount of time the broker will wait for a complete or fail response from the job worker. This comes after a job has been submitted to the job worker for processing and before it marks the job as available again for other job workers.

- [Job workers](https://docs.camunda.io/docs/next/components/concepts/job-workers#requesting-jobs)

### Job worker

A [Zeebe Client](#zeebe-client) that polls for and executes available [jobs](#job). An uncompleted job prevents [Zeebe](#zeebe) from advancing process execution to the next step.

- [Job workers](https://docs.camunda.io/docs/next/components/concepts/job-workers)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
