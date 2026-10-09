# Deploy to Amazon ECS — Deploy Camunda Hub — Access Camunda Hub

Camunda Hub is served through the shared Application Load Balancer, in addition to the paths documented in [Verify connectivity to Camunda 8](#verify-connectivity-to-camunda-8):

| Path       | Target                                 |
| ---------- | -------------------------------------- |
| `/hub*`    | Camunda Hub REST API and web interface |
| `/hub-ws*` | Camunda Hub websockets relay           |

Open `https://<alb_endpoint>/hub` and sign in with the identity provider `admin` user, using the password retrieved in step 3 of [Verify connectivity to Camunda 8](#verify-connectivity-to-camunda-8). To troubleshoot a task that doesn't reach a healthy state, use the [Camunda Hub health and metrics endpoints](https://docs.camunda.io/docs/next/self-managed/components/hub/monitoring) and the CloudWatch logs of the ECS service.

**Note**
The reference architecture configures a placeholder sender address and leaves the SMTP host unset, so Camunda Hub doesn't send user invitation emails. Configure your own SMTP server if you need email invitations.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
