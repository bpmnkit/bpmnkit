# Cluster scaling — Scale down — 1. Send the scale request to the Zeebe Gateway

Now we should tell Zeebe to move partitions away from the brokers that will be removed. For that, we send a POST request to the Zeebe Gateway's management endpoint. See [API reference](#api-reference) for more details.

If you haven't set up Ingress, you can first port-forward to access the Zeebe Gateway in your local machine:

```
kubectl port-forward svc/camunda-zeebe-gateway 9600:9600
```

```
curl -X 'PATCH' \
   'http://localhost:9600/orchestration/actuator/cluster' \
   -H 'accept: application/json' \
   -H 'Content-Type: application/json' \
   -d '{
        "brokers": {
          "remove": [3,4,5]
        }
      }'
```

Similar to scaling up, the response to this request would contain a `changeId`, `currentTopology`, planned changes, and expected topology.

**Warning: scaling down a zone-aware cluster**
For a zone-aware cluster, the same [changes](#2a-scale-brokers-only) as for scaling up are required.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
