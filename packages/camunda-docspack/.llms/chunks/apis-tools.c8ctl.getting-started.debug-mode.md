# c8ctl CLI — Debug mode

Enable debug logging to see detailed internal information such as plugin loading and credential resolution:

```bash
DEBUG=1 c8 list pi
# or
C8CTL_DEBUG=true c8 list pi
```

Debug output is written to stderr and does not interfere with normal command output.


## Next steps

- [Cluster inspection and process management](https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection) — list, search, and manage process instances, user tasks, incidents, and jobs.
- [Development workflows](https://docs.camunda.io/docs/next/apis-tools/c8ctl/development-workflows) — deploy, run, watch, and configure profiles and MCP proxy.
- [Extend `c8ctl` with plugins](https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins) — scaffold, install, and manage custom CLI plugins.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
