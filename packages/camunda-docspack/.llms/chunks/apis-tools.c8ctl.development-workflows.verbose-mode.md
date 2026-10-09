# Development workflows — Verbose mode

Use the `--verbose` flag to see detailed information about credential resolution, plugin loading, and other internal operations:

```bash
c8 deploy ./process.bpmn --verbose
c8 list pi --verbose
```


## Debug mode

Enable debug logging with environment variables for even more detailed output:

```bash
DEBUG=1 c8 deploy ./process.bpmn
C8CTL_DEBUG=true c8 list pi
```

Debug output is written to stderr and does not interfere with normal command output.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/development-workflows
