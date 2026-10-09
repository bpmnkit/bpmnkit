# Host custom connectors — Wiring your connector with a Camunda cluster

This approach is equivalent to the [hybrid mode](https://docs.camunda.io/docs/next/components/connectors/use-connectors-in-hybrid-mode), except you don't need to override
existing connectors and instead add a new one. You need to have a running Camunda cluster, and a pair
of `Client ID`/`Client Secret` with `Zeebe` and `Operate` scopes.
Learn more about [how to obtain required credentials](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-api-clients).

Run the following command:

```shell
docker run --rm --name=CustomConnectorInSaaS \
    -v $PWD/connector.jar:/opt/custom/connector.jar \
    -e LOADER_PATH=/opt/custom \
    -e CAMUNDA_CLIENT_CLOUD_CLUSTER_ID='<YOUR_CLUSTER_ID>' \
    -e CAMUNDA_CLIENT_AUTH_CLIENT_ID='<YOUR_CLIENT_ID>' \
    -e CAMUNDA_CLIENT_AUTH_CLIENT_SECRET='<YOUR_CLIENT_SECRET>' \
    -e CAMUNDA_CLIENT_CLOUD_REGION='<YOUR_CLUSTER_REGION>' \
        camunda/connectors-bundle:<desired-version>
```

The line `-v $PWD/connector.jar:/opt/custom/connector.jar` binds a volume with your connector at the path `$PWD/connector.jar`
of your local machine.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/host-custom-connector
