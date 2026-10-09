# Host custom connectors — Wiring your connector with Camunda Docker instance (without Keycloak)

This option is applicable if you launch your cluster in a Self-Managed version with
[Camunda Docker Compose variant without Keycloak](https://github.com/camunda/camunda-distributions/tree/main/docker-compose).

Run the following command:

```shell
docker run --rm --name=CustomConnectorInSMCore \
    -v $PWD/connector.jar:/opt/app/connector.jar \
    --network=camunda-platform_camunda-platform \
    -e CAMUNDA_CLIENT_BROKER_GATEWAY-ADDRESS=zeebe:26500 \
    -e CAMUNDA_CLIENT_SECURITY_PLAINTEXT=true \
    -e CAMUNDA_OPERATE_CLIENT_URL=http://operate:8080 \
    -e CAMUNDA_OPERATE_CLIENT_USERNAME=demo \
    -e CAMUNDA_OPERATE_CLIENT_PASSWORD=demo \
        camunda/connectors-bundle:<desired-version>
```

**Note**
Exact values of the environment variables related to Zeebe, Operate, or network may depend on your own configuration.


## Wiring your connector with Camunda Docker instance (with Keycloak)

This option is applicable if you launch your cluster in a Self-Managed version with
[Camunda Platform Docker Compose variant with Keycloak](https://github.com/camunda/camunda-distributions/tree/main/docker-compose).

Run the following command:

```shell
docker run --rm --name=CustomConnectorInSMWithKeyCloak \
    -v $PWD/connector.jar:/opt/app/connector.jar \
    --network=camunda-platform_camunda-platform \
    -e CAMUNDA_CLIENT_BROKER_GATEWAY-ADDRESS=zeebe:26500 \
    -e CAMUNDA_CLIENT_SECURITY_PLAINTEXT=true \
    -e CAMUNDA_CLIENT_ID=<YOUR_CAMUNDA_CLIENT_ID> \
    -e CAMUNDA_CLIENT_SECRET=<YOUR_CAMUNDA_CLIENT_SECRET> \
    -e ZEEBE_TOKEN_AUDIENCE=zeebe-api \
    -e ZEEBE_AUTHORIZATION_SERVER_URL=http://keycloak-service:18080/auth/realms/camunda-platform/protocol/openid-connect/token \
    -e CAMUNDA_IDENTITY_TYPE=KEYCLOAK \
    -e CAMUNDA_IDENTITY_AUDIENCE=operate-api \
    -e CAMUNDA_IDENTITY_ISSUER_BACKEND_URL=http://keycloak:18080/auth/realms/camunda-platform \
    -e CAMUNDA_IDENTITY_CLIENT_ID=connectors \
    -e CAMUNDA_IDENTITY_CLIENT_SECRET=<CONNECTORS_CLIENT_SECRET> \
    -e CAMUNDA_OPERATE_CLIENT_URL=http://operate:8080 \
        camunda/connectors-bundle:<desired-version>
```

**Note**
Exact values of the environment variables related to Zeebe, Operate, Keycloak, or network may depend on
your own configuration.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/host-custom-connector
