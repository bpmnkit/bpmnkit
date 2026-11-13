# casen build — Options

| Option | Description |
|--------|-------------|
| `-o, --out <file>` | Output `.bpmn` (default: the spec's name, or the `--edit` file) |
| `--edit <file.bpmn>` | Edit this file with a module spec, keeping its layout |
| `--deploy` | Deploy the `.bpmn`, its forms and any extra `.dmn`/`.form` files given after the spec |
| `--target auto\|local\|camunda8` | `auto`: `ZEEBE_REST_ADDRESS` (with `CAMUNDA_CLIENT_ID`, `CAMUNDA_CLIENT_SECRET`, `CAMUNDA_OAUTH_URL`, or `CAMUNDA_BASIC_AUTH_USERNAME`/`PASSWORD`), else the active profile, else local Reebe |
| `--no-lint` | Skip the lint |
| `--no-forms` | Do not generate forms for form-less user tasks |
| `--verbose` | Also list what the text reader completed (ends, joins, renamed ids) |

casen silences Node's process warnings (such as the proxy agent notice); `NODE_NO_WARNINGS=0` keeps them.

---
Source: https://bpmnkit.com/docs/cli/build
