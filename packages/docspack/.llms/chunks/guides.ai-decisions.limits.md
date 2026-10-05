# AI Decisions — Limits

These limits are from Cloudflare's model page:

- 1 to 64 questions for each call. A `choice` has 2 to 255 options. A `score` has 2 to 10 levels.
- The context window is 64k tokens. Long text state is truncated to fit.
- Images: 4 at most, 4 MiB each, 8 MiB in total. Data URLs only. Remote URLs are not accepted.
- A failed call (for example HTTP 401 or 429) fails the job. The template's retries and retry
  backoff apply. To raise a BPMN error instead, set the error expression.

---
Source: https://bpmnkit.com/docs/guides/ai-decisions
