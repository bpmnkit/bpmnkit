# Job worker

Let's take a deeper look at job workers to handle jobs.

**Job workers are the backbone of process automation in Camunda 8.** They handle automated tasks (service tasks) in your BPMN processes by continuously polling for available jobs and executing your business logic when jobs become available.

This guide covers everything you need to know about implementing and configuring job workers with the Camunda Java Client, from basic concepts to advanced features such as streaming, metrics, and multi-tenancy.


## Quick start

Before diving into the details, here is a simple example of creating a job worker:

```java
try (final JobWorker workerRegistration = client.newWorker()
        .jobType(jobType)
        .handler(new EmailJobHandler())
        .open()) {

    System.out.println("Job worker opened and receiving jobs of type: " + jobType);

    // Keep the worker running
    Thread.sleep(Duration.ofMinutes(10));
} catch (InterruptedException e) {
    throw new RuntimeException(e);
}

private static class EmailJobHandler implements JobHandler {
    @Override
    public void handle(final JobClient client, final ActivatedJob job) {
        // Perform your business logic here
        System.out.println("Processing job: " + job.getKey() + " for a process instance: " + job.getProcessInstanceKey());

        // Complete the job (or use client.newFailCommand() if something goes wrong)
        client.newCompleteCommand(job.getKey())
                .variables(Map.of("emailSent", true))
                .send()
                .join();
    }
}
```

For a complete walkthrough, see the [getting started guide](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started).

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/job-worker
