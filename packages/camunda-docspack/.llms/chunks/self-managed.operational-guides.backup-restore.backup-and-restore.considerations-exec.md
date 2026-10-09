# Camunda back up and restore — Considerations — exec

An alternative to port-forwarding is to run commands directly on Kubernetes pods.
In this example we're going to spawn a temporary pod to execute a curl request.
Alternatives are to use existing pods within the namespace. Camunda's pod includes different base images, each with a different feature set.

```bash
# following will create a temporary alias within your terminal to overwrite the normal curl
export CAMUNDA_NAMESPACE="camunda"
export CAMUNDA_RELEASE_NAME="camunda"
# temporary overwrite of curl, can be removed with `unalias curl` again
alias curl="kubectl run curl --rm -i -n $CAMUNDA_NAMESPACE --restart=Never --image=alpine/curl -- -sS"

curl $CAMUNDA_RELEASE_NAME-zeebe-gateway:9600/actuator/health
curl $CAMUNDA_RELEASE_NAME-optimize:8092/actuator/health
curl $CAMUNDA_RELEASE_NAME-elasticsearch:9200/_cluster/health
```

This allows you to directly execute commands within the namespace and communicate with available services.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore
