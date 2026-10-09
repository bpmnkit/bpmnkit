# Camunda components troubleshooting — Anomaly detection scripts — Zeebe connectivity scripts

These scripts focus on verifying the connectivity and health of Zeebe components within your deployment. You can check token generation, gRPC connectivity, and other essential aspects of your Zeebe setup.

#### gRPC Zeebe check (`./checks/zeebe/connectivity.sh`)

This script verifies connectivity to a Zeebe instance using HTTP/2 and gRPC protocols, providing insights into the health and status of your Zeebe deployment.

```bash
./checks/zeebe/connectivity.sh -a https://local.distro.example.com/auth/realms/camunda-platform/protocol/openid-connect/token -i myclientid -s 0Rn28VrQxGNxowrCWe6wbujwFghO4990 -u orchestration-api -H zeebe.local.distro.example.com:443
```

Find more information on [how to register your application on Identity](https://github.com/camunda-community-hub/camunda-8-examples/blob/main/payment-example-project/kube/README.md#4-generating-an-m2m-token-for-our-application).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
