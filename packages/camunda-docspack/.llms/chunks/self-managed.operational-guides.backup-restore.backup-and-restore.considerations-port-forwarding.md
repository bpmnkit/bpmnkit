# Camunda back up and restore — Considerations — port-forwarding

Port-forwarding allows you to temporarily bind a remote Kubernetes cluster port of a service or pod directly to your local machine, allowing you to interact with it via `localhost:PORT`.

Since the services are bound to your local machine, you **cannot reuse the same port for all port-forwards** unless you start and stop each one based on usage. To avoid this limitation, the examples use different local ports for each service, allowing them to run simultaneously without conflict.

```bash
export CAMUNDA_RELEASE_NAME="camunda"
# kubectl port-forward services/$SERVICE_NAME $LOCAL_PORT:$REMOTE_PORT
kubectl port-forward services/$CAMUNDA_RELEASE_NAME-zeebe-gateway 9600:9600 & \
kubectl port-forward services/$CAMUNDA_RELEASE_NAME-optimize 8092:8092 & \
kubectl port-forward services/$CAMUNDA_RELEASE_NAME-elasticsearch 9200:9200 &
```

Using the bash instruction `&` at the end of each line would run the command in a subshell allowing the use of a single terminal.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore
