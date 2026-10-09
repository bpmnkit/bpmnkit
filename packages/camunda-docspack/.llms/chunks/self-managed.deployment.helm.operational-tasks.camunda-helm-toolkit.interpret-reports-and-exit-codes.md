# Use the Camunda Helm Toolkit — Interpret reports and exit codes

Reports identify changes, warnings, and validation errors that need review before deployment.

| Option            | Purpose                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| `--output-format` | Select `json` (default), `yaml`, or `markdown` for the report.            |
| `--report-file`   | Save the report to a container path on a writable host-mounted directory. |
| `--strict`        | Treat warnings as validation errors when choosing the exit code.          |

Without `--report-file`, reports go to standard output, except when `migrate --output -` reserves it for YAML. The one-line summary goes to standard error.

| Exit code | Meaning                                               |
| --------- | ----------------------------------------------------- |
| `0`       | No warnings or errors.                                |
| `1`       | Tool or usage failure; don't rely on the output.      |
| `2`       | Warnings or manual follow-up required.                |
| `3`       | Validation errors, or warnings when using `--strict`. |

Inspect both the migrated YAML and the report. Some findings recommend changes the toolkit can't safely automate. For all command options, run `docker run --rm camunda/camunda-helm-toolkit:SNAPSHOT migrate --help` or replace `migrate` with `validate`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit
