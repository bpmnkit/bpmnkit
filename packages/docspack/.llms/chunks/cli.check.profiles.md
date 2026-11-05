# casen check — Profiles

| Profile | Use it when | What runs |
|---------|-------------|-----------|
| default | You edit a model that targets Camunda 8 | Every rule. Camunda 8 rules run only when the model names a platform (`modeler:executionPlatform`). A user task without a form is not reported. |
| `--sketch` | You draw a process before it targets an engine | Structure, flow, naming, FEEL syntax. No `deploy/`, `compat/`, `connector/` or `agentic/` rules, even if the model names a platform. |
| `--deploy` | You are about to deploy | Every rule, errors only. A user task without a form is required to have one (`compat/user-task-definition`). A `formId` or `decisionId` that none of the checked files defines is an error. |

Zeebe deploys a user task that has no form. So outside the deploy gate the "user task needs a
form" rule is off: it would push you to invent a form reference only to clear a warning. Turn
it on with `--user-task-forms require`. `casen lint lint` has the same `--profile sketch|deploy`
and `--user-task-forms` options.

---
Source: https://bpmnkit.com/docs/cli/check
