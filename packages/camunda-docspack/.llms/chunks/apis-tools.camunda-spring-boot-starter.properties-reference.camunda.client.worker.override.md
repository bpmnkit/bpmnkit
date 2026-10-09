# Properties reference — `camunda.client.worker.override`

Properties for overriding settings of individual job workers registered to the Camunda client. The key of the override is the job type or worker name.

  
    Property
    Description
    Default value
  

  

Enable or disable automatic job completion after method invocation.

Type: boolean

  null

  

Enable or disable the job worker.

Type: boolean

  null

  

List of variable names to fetch on job activation. When set in defaults, it extends the list of variables to fetch from the annotation. When set in an override, it replaces the list of variables to fetch.

Type: array[string]

  null

  

Sets whether all variables are fetched. Overrides `fetch-variables`.

Type: boolean

  null

  

The maximum number of jobs exclusively activated for this worker at the same time.

Type: integer

  null

  

The maximum number of retries before automatic responses (complete, fail, bpmn error) for jobs are no longer attempted.

Type: integer

  null

  

The name of the worker owner. If set to default, it is generated as `${beanName}#${methodName}`.

Type: string

  null

  

The maximal interval between polls for new jobs.

Type: duration

  null

  

The request timeout for the activate job request used to poll for new jobs.

Type: duration

  null

  

The backoff before a retry of a failed job is possible.

Type: duration

  null

  

Opt-in feature flag that enables job streaming. When enabled, the job worker uses both streaming and polling to activate jobs. A long-lived stream eagerly pushes new jobs, and polling retrieves jobs created before any streams were opened.

Type: boolean

  null

  

If streaming is enabled, sets the maximum duration the worker will wait without receiving any job on the open stream before canceling and recreating it. The timer is reset every time a job is received. Must be strictly less than `stream-timeout` when both are set.

Type: duration

  null

  

If streaming is enabled, sets the maximum lifetime for a stream. When this timeout is reached, the stream closes, and no more jobs are activated or received. If the worker is still open, a new stream opens immediately.

Type: duration

  null

  

Sets the tenant filter for the job worker, which determines how the worker considers tenant IDs when activating jobs.

Type: enum[assigned, provided]

  null

  

Sets the tenants for which the job worker is registered. When set in defaults, it extends the list of tenant IDs from the annotation. When set in override, it replaces the list of tenant IDs.

Type: array[string]

  null

  

The time a job remains exclusively assigned to the worker.

Type: duration

  null

  

The type of jobs to work on.

Type: string

  null

  

Activate the jobs polled by this worker with a lease. When enabled, each activated job is assigned a distinct lease token, fencing the complete, fail, and throw-error commands against a superseded activation of the same job.

Only applies to the polling path. If not set, jobs are activated without a lease.

Type: boolean

  null

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/properties-reference
