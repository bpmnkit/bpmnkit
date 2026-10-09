# Twilio connector — Required fields

### Send SMS operation

- `Body`: The content of the SMS message.
- `To number`: The phone number that you want to send the SMS message to.
- `From number`: The phone number to use as the sender of the SMS message.

**Note**
See the [Twilio documentation](https://www.twilio.com/docs/sms/send-messages) for more details.

### List messages operation

- `Date sent after`: (Optional) The date and time to start retrieving messages from. Messages sent on or after this date and time will be included in the results. The date and time must be in ISO 8601 format, such as `2023-04-19T08:30:00Z`.
- `Date sent before`: (Optional) The date and time to stop retrieving messages at. Messages sent before this date and time will be included in the results. The date and time must be in ISO 8601 format, such as `2023-04-19T08:30:00Z`.
- `From`: (Optional) The phone number that the message was sent from. Only messages sent from this phone number will be included in the results.
- `To`: (Optional) The phone number that the message was sent to. Only messages sent to this phone number will be included in the results.
- `Page size`: (Optional) The maximum number of messages to retrieve per page. This value must be between 1 and 1000.

**Note**
See the Twilio documentation on [filtering by date sent](https://www.twilio.com/docs/sms/api/message-resource?code-sample=code-read-list-messages-filter-by-before-sent-date&code-language=curl&code-sdk-version=json) and [getting filters](https://www.twilio.com/docs/sms/api/message-resource?code-sample=code-read-list-messages-matching-filter-criteria&code-language=curl&code-sdk-version=json) for more information.

### getMessage operation

- `Message SID`: The SID of the message you want to retrieve. See the [Twilio documentation](https://www.twilio.com/docs/sms/api/message-resource?code-sample=code-fetch-message&code-language=curl&code-sdk-version=json) for more details.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/twilio
