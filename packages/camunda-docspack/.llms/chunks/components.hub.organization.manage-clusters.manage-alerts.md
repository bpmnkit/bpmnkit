# Create an alert

Camunda 8 can notify you when process instances stop with an error.

Camunda 8 can notify you when process instances stop with an error.


## About alerts

There are two forms of notification:

- By email to the email address of your user account
- By webhook

**Note**
This feature is only available in SaaS.


## Create an alert

Create a new alert in Camunda Hub SaaS:

1. In the left navigation under **Clusters**, select a cluster.
1. On the **Alerts** tab, click **Create an alert**.

   ![cluster-details](./img/cluster-detail-alerts.png)

   ![create-alert](./img/cluster-detail-create-alert.png)

1. Choose between **Email** and **Webhook**:
   - **Email**: Click **Create**. No further information is needed.
   - **Webhook**: Provide a valid webhook URL that accepts `POST` requests.

If your webhook requires [HMAC authentication](https://www.okta.com/identity-101/hmac/), you can specify an HMAC secret. The SHA-256 hash of the request body will then be generated using your HMAC secret, and it is included it in the HTTP header `X-Camunda-Signature-256` each time we send out a webhook alert to your endpoint.

You will have one email alert per cluster, but you can create multiple webhook alerts if needed.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-alerts
