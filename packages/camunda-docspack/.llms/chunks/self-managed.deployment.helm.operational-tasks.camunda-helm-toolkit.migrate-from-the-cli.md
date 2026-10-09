# Use the Camunda Helm Toolkit — Migrate from the CLI

Run `migrate` to create an updated override file without modifying your source file.

From the directory containing `values-8.9.yaml`, run:

```bash
docker run --rm --pull always \
  --user "$(id -u):$(id -g)" --workdir /tmp \
  -v "$PWD":/work:ro \
  camunda/camunda-helm-toolkit:SNAPSHOT migrate \
  --input /work/values-8.9.yaml \
  --source 8.9 --target 8.10 \
  --output - > values-8.10.yaml
```

The container uses your user and group IDs and `/tmp` as its working directory. The input directory is mounted read-only. Docker writes the migrated YAML to standard output, and your shell saves it on the host. Choose a new output filename: shell redirection replaces an existing file, so never redirect to an input file.

With `--output -`, the report and summary go to standard error, separate from the YAML. A completed migration can produce output and still exit with warnings or validation errors. Check the exit code and findings before using the output; a tool failure can leave an empty redirected file.

Migration automatically validates each output against its target version. It changes keys present in your overrides, but doesn't add the target chart's defaults or automatically apply every recommended setting.

### Migrate layered overrides

Use repeated `--input` arguments and `--output-dir` to keep layered overrides separate.

From the directory containing your 8.9 `base.yaml` and `production.yaml` overrides, create a separate output directory and run:

```bash
mkdir -p migrated
docker run --rm --pull always \
  --user "$(id -u):$(id -g)" --workdir /tmp \
  --env TMPDIR=/output \
  -v "$PWD":/input:ro \
  -v "$PWD/migrated":/output \
  camunda/camunda-helm-toolkit:SNAPSHOT migrate \
  --input /input/base.yaml --input /input/production.yaml \
  --source 8.9 --target 8.10 \
  --output-dir /output \
  --output-format markdown --report-file /output/migration-report.md
```

The container runs with your user and group IDs so it can write to the output mount. `TMPDIR=/output` keeps temporary files on the same filesystem as the output, which is required when the toolkit moves completed files into place. The toolkit writes `migrated/base.yaml` and `migrated/production.yaml`, without merging them. Input basenames must be unique. Use a separate output directory for each migration to avoid replacing earlier results.

When you continue with the Helm upgrade guide, pass the migrated overrides in the same order: `-f migrated/base.yaml -f migrated/production.yaml`. Later files still take precedence on shared keys.

### Continue across additional versions

Review and correct each migrated output before using it as the next migration's input.

For example, to prepare 8.7 overrides for 8.9, run 8.7 to 8.8 first, then 8.8 to 8.9. Preparing files for several versions doesn't let you skip deployment upgrades or intermediate data migrations. Follow each version's upgrade guide in order.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit
