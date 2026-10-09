# HTTP Polling connector — Handling HTTP connector responses

The response from any HTTP connector contains the status, headers, and body. Learn more about the response structure [here](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#response).

To structure and utilize the response:

1. Set a **Result Variable** to store the HTTP response, e.g., `pollingData`.
2. Use a **Result Expression** to extract specific fields from the `={fieldProperty:body.fieldProperty}`.


## Examples

### Scenario 1: Monitoring GitHub issues

Monitor a GitHub issue to see when it's closed and if it has a specific label ('needs review').

#### Steps

1. Drag an intermediate event onto your BPMN diagram.
2. Choose the HTTP Polling connector template.
3. Configure the connector with the relevant details:
   - **URL**: `https://api.github.com/repos/[YourRepoOwner]/[YourRepoName]/issues/[IssueNumber]`
   - **Authorization Type**: Bearer token
   - **Bearer token**: `{{secrets.BEARER_TOKEN}}`
   - **Method**: `GET`
   - **Headers**: `={"Content-Type": "application/vnd.github+json","X-GitHub-Api-Version": "2022-11-28"}`
   - **Interval**: `PT10M` (Every 10 minutes) – This checks the GitHub issue every 10 minutes.
   - **Correlation Key (process)**: `=issueNumber`
   - **Correlation Key (payload)**: `=body.number`
   - **Activation Condition**: `=(body.state = "closed")`
   - **Result Expression**: `={issueUrl:body.html_url, needsReview: list contains((body.labels).name, "needs review")}` - Extract the issue URL and check if the label 'needs review' is present.

#### Example response

```json
{
  "status": 200,
  "body": {
    "number": 212,
    "title": "Important Issue",
    "labels": [{ "name": "bug" }, { "name": "needs review" }],
    "state": "closed",
    "html_url": "https://github.com/YourRepoOwner/YourRepoName/issues/212"
  }
}
```

In this scenario, once the issue #212 titled **Important Issue** is closed, the process will proceed. If the issue is also labeled **needs review**, this label can be leveraged in the next steps of the process. For instance, it can trigger the creation of a new issue for review or initiate other related actions.

### Scenario 2: Monitoring product stock levels

Suppose you're overseeing an e-commerce platform. It's vital to ensure certain popular products remain stocked to guarantee user satisfaction. Avoiding stock-outs is essential to prevent lost sales and keep customers happy. With Camunda's HTTP Polling connector, you can maintain a real-time stock level check.

#### Steps

1. Drag an intermediate event onto your BPMN diagram.
2. Choose the HTTP Polling connector template.
3. Configure the connector as follows:
   - **URL**: `https://inventory.yourstore.com/api/v2/products/12345/stock`
   - **Authorization Type**: Basic Authentication
   - **Username**: `[YourInventoryAPIUsername]`
   - **Password**: `{{secrets.PASSWORD}}`
   - **Interval**: `PT1H` (Every hour)
   - **Correlation Key (process)**: `=productID`
   - **Correlation Key (payload)**: `=body.productID`
   - **Activation Condition**: `=(body.stockLevel < 10)`
   - **Result Expression**: `={stockLevelResponse:body.stockLevel}`

#### Example response

```json
{
  "status": 200,
  "body": {
    "productID": 12345,
    "productName": "Wireless Bluetooth Earbuds",
    "stockLevel": 8,
    "lastUpdated": "2023-09-17T11:20:32Z"
  }
}
```

Whenever the stock level of this particular product goes below 10 units, the BPMN process can be set up to perform tasks such as notifying the supply chain, alerting marketing teams, or showcasing a "Low in Stock" badge on the product's webpage.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/polling
