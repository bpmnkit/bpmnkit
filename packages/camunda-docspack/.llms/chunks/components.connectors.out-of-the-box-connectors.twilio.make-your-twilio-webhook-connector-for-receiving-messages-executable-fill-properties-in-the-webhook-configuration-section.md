# Twilio connector — Make your Twilio Webhook connector for receiving messages executable — Fill properties in the Webhook Configuration section

1. Choose one of the required methods in the **Webhook method** property. For example, if you know the webhook will be triggered by the **POST** method, choose **POST**. Alternatively, if it is not essential to specify a specific method for the webhook trigger, select **ANY**.
2. Configure the **Webhook ID**. By default, the **Webhook ID** is pre-filled with a random value. This value will be part of the Webhook URL. For more details about Twilio Webhook URLs, refer to the section below on [activating the Twilio Webhook connector by deploying your diagram](#activate-the-twilio-webhook-connector-by-deploying-your-diagram).
3. Select **Enabled** in **HMAC authentication** if you want to use HMAC authentication. After that, set the [Twilio Auth Token](https://support.twilio.com/hc/en-us/articles/223136027-Auth-Tokens-and-How-to-Change-Them) as the shared secret key in the **HMAC secret key** field property.

**Note**
Use secrets to store your credentials securely. Refer to the [secrets documentation](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) for more details.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/twilio
