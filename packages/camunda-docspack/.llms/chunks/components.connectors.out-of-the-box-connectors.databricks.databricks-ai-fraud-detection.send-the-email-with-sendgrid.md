# Trigger a process from Databricks with a webhook — Send the email with SendGrid

After the review task, add a service task named `Send Email`, and change its type to the [SendGrid connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/sendgrid). This sends the analyst-approved version of `emailBody`.

| Setting          | Value                                                                           |
| :--------------- | :------------------------------------------------------------------------------ |
| SendGrid API Key | `{{secrets.SendGrid}}`                                                          |
| Sender Name      | Your organization's name, for example `Fraud Detection Team`.                   |
| Sender Email     | Your verified sender address, for example `community@camunda.com`.              |
| Receiver Name    | Leave blank, or provide a display name if you map one from the webhook payload. |
| Receiver Email   | `=emailAddress`                                                                 |
| Subject          | `Need more information about your transaction`                                  |
| Content Type     | `text/plain`                                                                    |
| Body             | `=emailBody`                                                                    |

Add an end event named `Fraud Escalated` after this task to close the high-risk path.

Here's what your completed diagram should look like in Web Modeler:

![Completed fraud detection process in Web Modeler](./img/fraud-detection-modeler-completed.png)

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks-ai-fraud-detection
