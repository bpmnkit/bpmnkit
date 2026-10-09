# Use an inbound connector — Consume unmatched events

You can configure a connector to consume all unmatched events from the event source by enabling the **Consume unmatched events** checkbox in the **Activation** section of the connector properties.

- When this option is enabled, the connector will consume all events that do not match the activation condition of any other connector with the same deduplication ID.
  This is useful in scenarios where you want to ensure that all events are processed, even if they do not match any specific activation condition.

- When this option is disabled, the connector will only consume events that match its activation condition. Events that do not match any activation condition will lead to an error.

Here are some examples of how this option will affect the behavior of the connector when enabled or disabled, when the activation conditions of all the connectors with the same deduplication ID do not match the incoming event:

  
    
      Connector
      Consume unmatched events
    
    
      ✅ Enabled
      ◻️ Disabled
    
  
  
    
      Webhook Connector
      Return a success response (200)
      Return an error response (422, or specific HTTP status code depending on the error)
    
    
      Kafka Connector
      Commit the message offset
      Do not commit the message offset
    
    
      RabbitMQ Connector
      Acknowledge the message
      Reject the message
    
    
      AWS SQS Connector
      Delete the message from the queue
      Do not delete the message from the queue
    
    
      Email Connector
      Mark the email as processed (e.g. marked as read, deleted, or moved)
      Do not mark the email as processed

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/inbound
