# GitHub connector — Make your GitHub Webhook connector for receiving messages executable

1. In the **Webhook Configuration** section, configure the **Webhook ID**. By default, **Webhook ID** is pre-filled with a random value. This value will be part of the Webhook URL. You will find more details about GitHub Webhook URLs [below](#activate-the-github-webhook-connector-by-deploying-your-diagram).
2. Set the **GitHub secret**. This is a shared secret key that has to be defined in both your BPMN and GitHub webhook configuration page. The value is used to calculate HMAC authentication signature.
3. Configure **Activation Condition**. For example, given GitHub triggers a webhook endpoint with a new PR payload `{"action": "opened", "pull_request": ...}`, the **Activation Condition** value might look like as `=(request.body.action = "opened")`. Leave this field empty to trigger your webhook every time.
4. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
5. Use **Result Expression** to map specific fields from the response into process variables using [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel).
   For example, given that the GitHub webhook is triggered with the body `{"pull_request": {"id": 123}}` and you would like to extract the pull request `id` as a process variable `pullRequestId`, the **Result Expression** might look like this:

```
= {
  pullRequestId: request.body.pull_request.id
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/github
