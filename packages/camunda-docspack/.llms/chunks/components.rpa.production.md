# RPA production setup

Configure your RPA workers for production use cases.

Use the RPA worker’s production configuration options to run RPA scripts reliably at scale.


## Configuration options

### Transition from a development setup

When moving from development to production, consider the following:

- **Disable the local sandbox**: If the worker should only accept scripts from Zeebe and not from Desktop Modeler, disable local execution by setting `camunda.rpa.sandbox.enabled=false`.
- **Install required third-party tools**: Install any external tools your scripts rely on so the worker can access them.
- **Add tags to your workers and scripts**: Tag workers based on their capabilities, such as operating systems or installed applications. See [Labels](#labels) for details.

### Use secrets

When running an RPA worker with Camunda SaaS, you can access [connector secrets](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#using-secrets).

To do this:

1. [Create client credentials](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client) with both the `Orchestration Cluster API` and `Administration API - Resource: Secrets` scopes.
2. Use them in the worker config by adding the secrets endpoint to your `rpa-worker.properties` file:

```properties
camunda.rpa.zeebe.secrets.secrets-endpoint=https://cluster-api.cloud.camunda.io
```

In the RPA script, your secrets are stored in the `${secrets}` variable. You can reference a secret like `MY_API_KEY` with `${secrets.MY_API_KEY}`.

### Labels

Use tags and labels to differentiate worker capabilities.

1. In the `rpa-worker.properties`, add:

   ```properties
   camunda.rpa.zeebe.worker-tags=accounting-system
   ```

2. If you also want the worker to work on unlabeled tasks, use:

   ```properties
   camunda.rpa.zeebe.worker-tags=default,accounting-system
   ```

3. Add a label to your script when configuring the RPA task in your diagram.

Labels describe capabilities. If you want your worker to only pick up a specific script, use a unique label on both the worker and the RPA task.

If no label is defined, both the task and worker will use the label `default`.

### Pre- and post-run scripts

Some scripts require environment setup before they run. To use pre- or post-run scripts:

1. Create and deploy separate RPA scripts.
2. Reference them in the properties panel of the RPA task.

**Note**
The worker removes the job’s working directory after the job completes.

### Timeouts

To set timeouts:

- **On the RPA task (recommended)**: Set the timeout when configuring the RPA task in your diagram.
- **In the worker**: Use the default timeout in `rpa-worker.properties` as a fallback.

### Concurrent jobs

To enable concurrent jobs, set `camunda.rpa.zeebe.max-concurrent-jobs` in the worker config. Enable this only if your scripts, such as browser automation, can run safely in parallel.

### Additional libraries

To install additional dependencies:

1. Create a `requirements.txt` file listing required packages.
2. Set `camunda.rpa.python.extra-requirements=extra-requirements.txt` in the properties file.
3. Restart the worker to install them.

Use [labels](#labels) to ensure scripts run only on compatible workers.

For example, to use Playwright:

```txt
## requirements.txt
robotframework-browser
```

```properties
## application.properties
camunda.rpa.python.extra-requirements=extra-requirements.txt
camunda.rpa.zeebe.worker-tags=default,playwright
```

---
Source: https://docs.camunda.io/docs/next/components/rpa/production
