# Configuration — Job worker configuration options — Control variable fetching

By default, a job worker fetches **all** process variables when activating a job. To improve performance and keep your code clean, you should fetch only the variables your worker actually needs. See [writing good workers](https://docs.camunda.io/docs/next/components/best-practices/development/writing-good-workers#data-minimization-in-workers) for more guidance on minimizing data transfer.

#### Using `@Variable` (recommended)

The recommended approach is to declare each variable you need as a typed method parameter annotated with `@Variable`. The SDK automatically fetches only those variables and injects them directly — no type casting required:

```java
@JobWorker
public void checkPayment(@Variable String orderId, @Variable BigDecimal amount) {
  // only 'orderId' and 'amount' are fetched; types are enforced automatically
}
```

With the [`-parameters` compiler flag](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started#enable-the-java-compiler--parameters-flag) enabled, the parameter name is used as the variable name automatically. To use a different variable name, set it explicitly on the annotation:

```java
@JobWorker
public void checkPayment(@Variable(name = "order_id") String orderId) {
  // fetches the process variable 'order_id' into the 'orderId' parameter
}
```

**Note**
This adds the variable name to the list of variables fetched from the process.

#### Using `@VariablesAsType`

For workers that operate on multiple related variables, `@VariablesAsType` maps process variables to your own class, eliminating individual type casts. Jackson's `@JsonProperty` annotation is respected. Return the updated object to write changes back to the process:

```java
@JobWorker
public PaymentVariables checkPayment(@VariablesAsType PaymentVariables vars) {
  // access typed fields directly — no casting needed
  vars.setApproved(vars.getAmount().compareTo(BigDecimal.valueOf(100)) <= 0);
  return vars; // return the object to write updated fields back to the process
}
```

**Note**
This adds the names of the fields of the used type to the list of variables fetched from the process.

#### Provide an explicit list of variables to fetch

If you need access to the raw `ActivatedJob` or `JobClient` objects, you can specify an explicit list of variable names to avoid fetching all variables:

```java
@JobWorker(fetchVariables = {"orderId", "amount"})
public void checkPayment(final JobClient client, final ActivatedJob job) {
  String orderId = (String) job.getVariablesAsMap().get("orderId");
  // ...
}
```

You can also override the variables to fetch in your properties:

```yml
camunda:
  client:
    worker:
      override:
        checkPayment:
          fetch-variables:
            - orderId
            - amount
```

**Caution**
Using the properties-defined way of fetching variables will override **all** other detection strategies.

#### Fetch all variables

If your worker genuinely needs every process variable, you can force fetching all variables:

```java
@JobWorker(fetchAllVariables = true)
public void checkPayment(final ActivatedJob job) {
  // all variables are available via job.getVariablesAsMap()
}
```

You can also set this in your properties:

```yml
camunda:
  client:
    worker:
      override:
        checkPayment:
          force-fetch-all-variables: true
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
