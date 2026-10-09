# Cluster inspection and process management — Topology

Retrieve cluster topology information:

```bash
c8 get topology
```


## Process instances

Business IDs require Camunda 8.9 or newer.

### List process instances

```bash
c8 list pi
c8 list process-instances

# Filter by BPMN process ID
c8 list pi --id=order-process

# Filter by state
c8 list pi --state=ACTIVE

# Filter by Business ID
c8 list pi --businessId=order-123
```

### Get a process instance

```bash
c8 get pi 2251799813685249

# Include variables in the output
c8 get pi 2251799813685249 --variables
```

### Create a process instance

```bash
c8 create pi --id=order-process

# With a specific version
c8 create pi --id=order-process --version=2

# With variables
c8 create pi --id=order-process --variables='{"orderId":"12345","amount":100}'

# With variables read from a file (avoids shell quoting issues)
c8 create pi --id=order-process --variables=@vars.json

# With variables read from stdin
cat vars.json | c8 create pi --id=order-process --variables=@-

# With a Business ID for business-level correlation
c8 create pi --id=order-process --businessId=order-123

# Create and wait for completion
c8 create pi --id=order-process --awaitCompletion

# With a custom timeout (30 seconds)
c8 create pi --id=order-process --awaitCompletion --requestTimeout=30000
```

### Await process instance completion

The `await` command is a shorthand for `create` with `--awaitCompletion`. It uses the Orchestration Cluster API's built-in server-side waiting:

```bash
c8 await pi --id=order-process
c8 await pi --id=order-process --variables='{"orderId":"12345"}'
c8 await pi --id=order-process --businessId=claim-456
c8 await pi --id=order-process --requestTimeout=60000
```

The `--requestTimeout` option sets the maximum wait time in milliseconds. When omitted or set to `0`, the cluster's default request timeout applies.

### Cancel a process instance

```bash
c8 cancel pi 2251799813685249
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
