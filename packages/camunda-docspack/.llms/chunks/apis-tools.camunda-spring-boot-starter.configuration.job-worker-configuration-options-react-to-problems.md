# Configuration — Job worker configuration options — React to problems

#### Throw a `BpmnError`

If your code encounters a problem that should trigger a [BPMN error](https://docs.camunda.io/docs/next/components/modeler/bpmn/error-events/error-events), throw a `BpmnError` and provide the error code defined in BPMN:

```java
@JobWorker
public void processOrder() {
  // some work
  if (businessError) {
    // problem shall be indicated to the process:
    throw CamundaError.bpmnError("ERROR_CODE", "Some explanation why this does not work");
    // this is a static function that returns an instance of BpmnError
  }
}
```

#### Fail jobs in a controlled way

Whenever you want a job to fail in a controlled way, you can throw a `JobError` and provide parameters like `variables`, `retries` and `retryBackoff`:

```java
@JobWorker
public void processOrder() {
  try {
    // some work
  } catch (DynamicRetryException e) {
    // problem shall be indicated to the process:
    throw CamundaError.jobError("Error message", new ErrorVariables(), null, this::calculateRetryBackoff, e);
    // this is a static function that returns an instance of JobError with a dynamic retry backoff
  } catch (StaticRetryException e) {
    // problem shall be indicated to the process:
    throw CamundaError.jobError("Error message", new ErrorVariables(), null, Duration.ofSeconds(10), e);
    // this is a static function that returns an instance of JobError with a static retry backoff
  }
}
```

The JobError takes 5 parameters:

- `errorMessage`: String
- `variables`: Object _(optional)_, default `null`
- `retries`: Integer _(optional)_, defaults to `job.getRetries() - 1`
- `retryBackoff`: Duration _or_ `Function<Integer, Duration>` _(optional)_, defaults to the configured retry backoff; function input is the retries value that will be submitted
- `cause`: Exception _(optional)_, defaults to `null`

**Note**
The job error is sent to the engine by the SDK calling the [Fail Job API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/fail-job.api). The stacktrace of the job error will become the actual error message. The provided cause will be visible in Operate.

#### Implicitly failing jobs

If your handler method would throw any other exception than the ones listed above, the default Camunda Client error handling will apply, decrementing retries with a `retryBackoff` of 0.

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
