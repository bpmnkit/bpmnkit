# WhatsApp connector — Authentication

The **WhatsApp connector** supports authentication through Meta access tokens. Take a look at [this blog post](https://developers.facebook.com/blog/post/2022/12/05/auth-tokens/) to learn more on how to obtain one for yourself.

Once the token is obtained, put it in the **Access token** field of the **Authentication** section.

**Note**
Use secrets to avoid exposing your WhatsApp access token credentials as plain text.
See our documentation on [managing secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to learn more.


## Sender and recipient

Your WhatsApp application can have multiple phone numbers registered. Set your phone number ID in the **Sender phone number ID** field
of the **Payload** section. You can find the phone number ID at the Meta developer portal.

In the **Recipient phone number** field, enter a phone number you wish to send message to.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/whatsapp
