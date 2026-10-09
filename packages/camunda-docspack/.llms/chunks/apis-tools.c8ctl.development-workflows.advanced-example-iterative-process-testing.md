# Development workflows — Advanced example: iterative process testing

This example demonstrates an end-to-end development workflow — auto-deploying on save, starting a process instance with variables loaded from a file, monitoring execution in real time, and retrieving the result.

### 1. Start watch mode

In a terminal, start `c8ctl` in watch mode to auto-deploy resources whenever you save changes:

```bash
c8 watch
```

Now edit your `.bpmn`, `.dmn`, or `.form` files in your editor. Every time you save, `c8ctl` redeploys automatically.

### 2. Prepare process variables

In a different terminal, load variables from a JSON file into a shell variable:

```bash
export processVar=$(<order-data.json)
```

### 3. Switch to JSON output

JSON output makes it easy to extract keys from command results:

```bash
c8 output json
```

### 4. Start a process instance

Create a new process instance with the loaded variables:

```bash
c8 create pi --id=order-process --variables="{\"orderData\": $processVar}"
```

The JSON output returns the process instance key, for example `2251799813685260`.

### 5. Monitor execution

In a **separate terminal**, use `watch` (the Unix utility) to poll the process instance status every second:

```bash
watch -n 1 c8ctl search pi --key=2251799813685260
```

This continuously refreshes until the process instance reaches the `COMPLETED` state.

### 6. Retrieve the result

Once the process instance is complete, get the final state including all variables:

```bash
c8 get pi 2251799813685260 --variables
```

**Tip**
You can combine steps 4 and 5 by using `c8 await pi` instead, which creates a process instance and waits for completion in a single command:

```bash
c8 await pi --id=order-process --variables="{\"orderData\": $processVar}" --fetchVariables
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/development-workflows
