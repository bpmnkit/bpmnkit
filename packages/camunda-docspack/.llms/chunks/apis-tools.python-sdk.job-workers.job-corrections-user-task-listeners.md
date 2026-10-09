# Job Workers — Job Corrections (User Task Listeners)

When a job worker handles a [user task listener](https://docs.camunda.io/docs/next/components/concepts/user-task-listeners), it can correct task properties (assignee, due date, candidate groups, etc.) as part of the completion. Return a `JobCompletionRequest` with a `result` containing `JobResultCorrections`:

<!-- snippet-source: examples/readme.py | regions: ReadmeJobCorrections -->

```python
from camunda_orchestration_sdk import ConnectedJobContext
from camunda_orchestration_sdk.models import (
    JobCompletionRequest,
    JobResultUserTask,
    JobResultCorrections,
)

async def validate_task(job: ConnectedJobContext) -> JobCompletionRequest:
    return JobCompletionRequest(
        result=JobResultUserTask(
            type_="userTask",
            corrections=JobResultCorrections(
                assignee="corrected-user",
                priority=80,
            ),
        ),
    )
```

To deny a task completion (reject the work), set `denied=True`:

<!-- snippet-source: examples/readme.py | regions: ReadmeJobCorrectionsDenied -->

```python
async def review_task(job: ConnectedJobContext) -> JobCompletionRequest:
    return JobCompletionRequest(
        result=JobResultUserTask(
            type_="userTask",
            denied=True,
            denied_reason="Insufficient documentation",
        ),
    )
```

| Correctable attribute | Type          | Clear value       |
| --------------------- | ------------- | ----------------- |
| `assignee`            | `str`         | Empty string `""` |
| `due_date`            | `datetime`    | Empty string `""` |
| `follow_up_date`      | `datetime`    | Empty string `""` |
| `candidate_users`     | `list[str]`   | Empty list `[]`   |
| `candidate_groups`    | `list[str]`   | Empty list `[]`   |
| `priority`            | `int` (0–100) | —                 |

Omitting an attribute or passing `None` preserves the persisted value. This works with all handler types (async, thread, and process).

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/job-workers
