# casen migrate — A model Camunda 8 would refuse

The converted model must deploy. When Zeebe would reject it, nothing is written, the report is
still printed, and the reasons come first:

```
order.bpmn
  ✖ Not deployable on Camunda 8.10: 2 error(s)
    - Message_PaymentConfirmed: Must have exactly one zeebe:subscription extension element (zeebe/message-subscription)
    - Task_summary: Must have either one 'zeebe:script' or one 'zeebe:taskDefinition' extension element (zeebe/script-task-implementation)
    Nothing written. Pass --placeholders to fill placeholder values (reported as manual
    work to replace), or --no-validate to write the model as it is.
  19 convertible · 8 manual · 2 unsupported
  …
```

The command exits 1 with `1 of 1 file would not deploy on Camunda 8 — pass --placeholders or
--no-validate`. With `--placeholders`, each value the conversion could not derive (a job type,
a correlation key) gets a placeholder such as `placeholder-Task_summary`, listed under `MANUAL`
as `placeholder jobType`; replace it before going live. In JSON, a refused file has
`"refused": true`, the `error`, and the `counts` and `findings` of the report.

---
Source: https://bpmnkit.com/docs/cli/migrate
