# Twilio connector — Configure your Twilio account

To set a webhook URL in Twilio for SMS, follow these steps:

1. Log in to your Twilio account at [www.twilio.com/console](https://www.twilio.com/console).
2. Navigate to the **Phone Numbers** section, which you can find in the left-hand side menu.
3. Click on the phone number for which you want to set the webhook URL.
4. Scroll down to the **Messaging** section and locate the **A message comes in** field.
5. In the input box next to **A message comes in**, enter the URL where you want Twilio to send incoming SMS messages and choose the required method.
6. Save your changes.

Once you have set the webhook URL, Twilio will send a `POST` or `GET` request to that URL whenever an incoming SMS message is received on the specified phone number.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/twilio
