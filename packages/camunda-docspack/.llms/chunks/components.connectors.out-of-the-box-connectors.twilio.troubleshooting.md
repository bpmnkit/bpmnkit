# Twilio connector — Troubleshooting

If you are having issues with the Twilio connector, try the following:

- Ensure your Twilio credentials are correct.
- Ensure you have set up your Twilio account and have a valid phone number.
- Ensure your configuration properties are set correctly.
- Check the logs for any error messages.
- Contact [Camunda support](https://camunda.com/services/support/) if you need further assistance.

For more information on using Twilio, visit the [official documentation](https://www.twilio.com/docs).


## Using Twilio connector Best Practices

When using the Twilio connector in a BPMN process, it is important to keep in mind that there may be delays in message delivery or processing, and that some messages may fail to be delivered due to various reasons such as invalid phone numbers, network issues, etc. To ensure that messages are sent and delivered reliably, it is recommended to build your BPMN diagram to handle retries and error scenarios.

One way to achieve this is by using an intermediate timer event to trigger a retry after a certain amount of time has elapsed, or by using an error boundary event to catch and handle errors in the process.

**Note**
To avoid performance issues, it is recommended to limit the number of retries and to implement proper error handling mechanisms in your process.

To learn more about implementing retry and error handling logic in your BPMN diagram, you can refer to the [Camunda BPMN examples](https://camunda.com/bpmn/examples/) page, which includes examples of BPMN diagrams with timer and error configurations.

The **Twilio Webhook connector** is an inbound connector that enables you to start a BPMN process instance triggered by a [Twilio event](https://www.twilio.com/docs/usage/webhooks).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/twilio
