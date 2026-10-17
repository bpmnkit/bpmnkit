# Migration-ready solutions — No transaction managers

You should not trust ACID [transaction managers](https://blog.bernd-ruecker.com/achieving-consistency-without-transaction-managers-7cb480bd08c) to glue together the workflow engine with your business code.

- Instead, embrace eventual consistency and make every service task its own transactional step. If you are familiar with Camunda 7 lingo, this means that all BPMN elements will be `async=true`.
- A process solution that relies on five service tasks to be executed within one ACID transaction, probably rolling back in case of an error, will make migration challenging.


## Don’t expose Camunda API

You should apply the [information hiding principle](https://en.wikipedia.org/wiki/Information_hiding) and not expose too much of the Camunda API to other parts of your application.

In the following example, you should not hand over an execution context to your `CrmFacade`:

```java
// DO NOT DO THIS!
crmFacade.createCustomer(execution);
```

The same holds true when a new order is placed, and your order fulfillment process should be started. Instead of the frontend calling the Camunda API to start a process instance, provide your own endpoint to translate between the inbound REST call and Camunda.

For example:

```java
@RestController
public class OrderFulfillmentRestController {

  @Autowired
  private ProcessEngine camunda;

  @RequestMapping(path = "/order", method = POST)
  public ResponseEntity<StatusDto> placeOrder(@RequestBody OrderDto orderPayload) throws Exception {
    // TODO: Somehow extract data from orderPayload
    OrderData orderData = OrderData.from(orderPayload);

    ProcessInstance pi = camunda.getRuntimeService()
        .startProcessInstanceByKey("orderFulfillment", Variables.putValue("order", orderData));

    response.setStatus(HttpServletResponse.SC_ACCEPTED);
    return ResponseEntity.accepted().body(StatusDto.of("pending"));
  }
}
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-readiness
