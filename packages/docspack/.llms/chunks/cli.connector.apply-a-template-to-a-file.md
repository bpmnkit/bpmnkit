# casen connector — Apply a template to a file

`apply` configures one element of an existing `.bpmn` file with a template, using the same keys
`show --condensed` prints. Values come from a JSON file (an object of key to string, number or
boolean, best for multi-line or quoted FEEL), from repeated `--set key=value`, or both; `--set`
wins. A value starting with `=` is FEEL, kept as written.

```sh
casen connector apply order.bpmn Call http --values call.json
casen connector apply order.bpmn Call http --set method=GET --set retryCount=5 --dry-run
```

Properties you leave out keep the template default. Any problem, such as a misspelled key (with a
suggestion), a missing required value or a value for a field that does not apply, exits non-zero
and leaves the file unchanged. `--dry-run` checks the values without writing.

---
Source: https://bpmnkit.com/docs/cli/connector
