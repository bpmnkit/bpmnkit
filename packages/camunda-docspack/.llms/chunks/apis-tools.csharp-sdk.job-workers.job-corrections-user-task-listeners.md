# Job Workers — Job Corrections (User Task Listeners)

When handling jobs from [user task listeners](https://docs.camunda.io/docs/next/components/concepts/user-task-listeners), you can return a `JobCompletionRequest` to apply corrections to the task or deny the action. Return a `JobCompletionRequest` from the handler instead of a plain variables object:

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: JobCorrections -->

```csharp
client.CreateJobWorker(config, async (job, ct) =>
{
    // Apply corrections to the user task
    return new JobCompletionRequest
    {
        Variables = new { reviewed = true },
        Result = new JobResultUserTask
        {
            Corrections = new JobResultCorrections
            {
                Assignee = "new-assignee",
                Priority = 75,
                CandidateGroups = new List<string> { "managers" },
            },
        },
    };
});
```

To deny the user task action (e.g. reject a completion):

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: JobCorrectionsDenied -->

```csharp
client.CreateJobWorker(config, async (job, ct) =>
{
    return new JobCompletionRequest
    {
        Result = new JobResultUserTask
        {
            Denied = true,
            DeniedReason = "Missing required fields",
        },
    };
});
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/job-workers
