# Process Templates — Use a template

Pick one of three ways from a template's page:

- **Open in editor** opens the diagram in the [browser editor](/editor). The link is
  `/editor?template=<id>`, and it only accepts a template id from the gallery.
- **Download .bpmn** saves the process model. The page also links the scenarios file and any
  DMN or form files.
- **`bpmnkit template use`** writes all the files into your project:

```sh
bpmnkit template list                          # all templates
bpmnkit template list --category ai-agents     # one category
bpmnkit template use purchase-request-approval processes/
```

```text
✓ Wrote processes/purchase-request-approval.bpmn
✓ Wrote processes/purchase-request-approval.bpmn.tests.json
✓ Wrote processes/approval-matrix.dmn
```

`bpmnkit template use` does not overwrite a file that already exists. Pass `--force` to
overwrite it. Then deploy each file with `bpmnkit deploy deploy <file> --target camunda8`, or
deploy them from the editor.

---
Source: https://bpmnkit.com/docs/guides/templates
