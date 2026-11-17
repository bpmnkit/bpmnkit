# AI setup — for agents — Commands

| Task | Command |
| --- | --- |
| Build, lint | `casen build spec.txt` |
| Build, lint, deploy | `casen build spec.txt --deploy` |
| Edit a file, layout kept | `casen build edit.mjs --edit order.bpmn` (module: `export default (kit, model) => …`) |
| Target Camunda version | `--camunda 8.10` |
| Output path | `-o out.bpmn` (default: spec name, or the `--edit` file) |
| Extra resources | `casen build spec.txt --deploy rules.dmn custom.form` |
| Deploy target | `--target auto\|local\|camunda8` (default `auto`: `ZEEBE_REST_ADDRESS` env, else profile, else local Reebe) |
| Skip lint / forms | `--no-lint` / `--no-forms` |
| See what the reader completed | `--verbose` |

Spec syntax: `casen agent-card bpmn --text`. Do not guess it.

---
Source: https://bpmnkit.com/docs/guides/ai-setup-for-agents
