# Development workflows — Run

The `run` command deploys a file and immediately creates a process instance in a single step:

```bash
c8 run ./order-process.bpmn

# With variables
c8 run ./order-process.bpmn --variables='{"orderId":"12345","amount":100}'

# With a Business ID
c8 run ./order-process.bpmn --businessId=order-123

# Deploy a file with an unsupported extension
c8 run ./process.xml --force
```


## Watch

Watch a directory for file changes and auto-redeploy on save:

```bash
c8 watch

# Watch a specific directory
c8 watch ./my-project

# Monitor only specific file extensions
c8 watch --extensions=.bpmn,.dmn,.form

# continue watching current directory
# even when deployment fails
c8 watch --force
```

By default, `c8ctl` monitors the same extensions used by `deploy`. Use `--extensions` to override. Use `--force` to continue watching after deployment errors.

When watching inside a process application (a folder tree containing a `.process-application` marker file), use `--process-application` (or its alias `--pa`) to watch and redeploy the entire application on each change:

```bash
c8 watch ./my-app --pa
```

### Continue watching after deployment errors

By default, `c8ctl` stops watching when a deployment fails with an error. Use `--force` to continue watching and redeploy on subsequent file changes, even after errors:

```bash
c8 watch --force
c8 watch ./my-project --force
```

This is useful during active development when your resources may temporarily be in an invalid state.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/development-workflows
