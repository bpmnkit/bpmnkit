# Resolve incidents and update variables — Create a process instance

Create a process instance with an `orderValue` of `"99"`:

```
./bin/zbctl --insecure create instance order-process --variables '{"orderId": "1234", "orderValue":"99"}'
```

```
./bin/zbctl.darwin --insecure create instance order-process --variables '{"orderId": "1234", "orderValue":"99"}'
```

```
./bin/zbctl.exe --insecure create instance order-process --variables '{\"orderId\": \"1234\", \
"orderValue\": \"99\"}'
```


## Advance an instance to an XOR gateway

To advance the instance to our XOR gateway, we’ll create a job worker to complete the `Initiate Payment` task:

```
./bin/zbctl --insecure create worker initiate-payment --handler cat
```

```
./bin/zbctl.darwin --insecure create worker initiate-payment --handler cat
```

```
./bin/zbctl.exe --insecure create worker initiate-payment --handler "findstr .*"
```

We’ll publish a message that will be correlated with the instance, so we can advance past the `Payment Received` intermediate message catch event:

```
./bin/zbctl --insecure publish message "payment-received" --correlationKey="1234"
```

```
./bin/zbctl.darwin --insecure publish message "payment-received" --correlationKey="1234"
```

```
./bin/zbctl.exe --insecure publish message "payment-received" --correlationKey="1234"
```

In the Operate interface, you should now observe the process instance has an [incident](https://docs.camunda.io/docs/next/components/concepts/incidents), which means there’s a problem with process execution that must be fixed before the process instance can progress to the next step.

![A process instance with one incident shown in the header, the Order Value? gateway marked with an incident indicator in the diagram, and the Incidents tab open in the bottom panel listing the extract value error.](./img/resolve-incidents-update-variables.png)

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/resolve-incidents-update-variables
