# Create an alert — Webhook alerts

Webhook alerts contain a JSON body with following structure:

```json
{
  "clusterName": "cluster-name",
  "clusterId": "88d32bfc-4f8e-4dd3-9ae2-adfee281e223",
  "operateBaseUrl": "https://console.camunda.io/org/2b3bc239-ad5b-4eef-80e0-6ef5139ed66a/cluster/88d32bfc-4f8e-4dd3-9ae2-adfee281e223/operate",
  "clusterUrl": "https://console.camunda.io/org/2b3bc239-ad5b-4eef-80e0-6ef5139ed66a/cluster/88d32bfc-4f8e-4dd3-9ae2-adfee281e223",
  "alerts": [
    {
      "operateUrl": "https://console.camunda.io/org/2b3bc239-ad5b-4eef-80e0-6ef5139ed66a/cluster/88d32bfc-4f8e-4dd3-9ae2-adfee281e223/operate/#/instances/2251799829404548",
      "processInstanceId": "1234567890123456",
      "errorMessage": "something went wrong",
      "errorType": "JOB_NO_RETRIES",
      "flowNodeId": "node-id",
      "jobKey": 1234567890123456,
      "creationTime": "2021-07-22T08:00:00.000+0000",
      "processName": "process-name",
      "processVersion": 1,
      "processVersionTag": "versionTag"
    }
  ]
}
```

**Warning: breaking change**
The JSON format was changed in 8.8.9. See [release announcements](https://docs.camunda.io/docs/next/reference/announcements-release-notes/880/880-announcements#apis--tools#webhook-alerts-json-format) for more information and required actions.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-alerts
