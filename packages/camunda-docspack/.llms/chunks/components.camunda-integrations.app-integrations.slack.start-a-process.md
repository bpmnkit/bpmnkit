# Camunda for Slack — Start a process

Run `/camunda start` to open a modal that walks you through the organization, the cluster, and the process definition, and then shows the start form.


## Forms in Slack

A Camunda form completed from Slack renders in one of three ways, decided by the form itself:

| Outcome     | When                                                                                      | What you see                                                       |
| :---------- | :---------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| Interactive | The form renders in Block Kit                                                             | A modal with real inputs                                           |
| JSON        | The form has no schema                                                                    | A single input box for a JSON payload                              |
| Unsupported | The form uses FEEL expressions, contains a file picker, or is too large for a Slack modal | "This form can't be filled in Slack. Open it in Tasklist instead." |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/slack
