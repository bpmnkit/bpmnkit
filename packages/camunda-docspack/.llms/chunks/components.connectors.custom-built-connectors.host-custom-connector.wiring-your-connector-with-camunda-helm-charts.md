# Host custom connectors — Wiring your connector with Camunda Helm charts

There are multiple ways to configure a Helm/Kubernetes Self-Managed cluster.
Refer to the [official guide](https://docs.camunda.io/docs/next/self-managed/setup/overview) to learn more.

For the purpose of this section, imagine you installed Helm charts with `helm install camunda camunda/camunda-platform --version $HELM_CHART_VERSION`,
and forwarded the Zeebe and Operate ports. If you use [Keycloak deployed via the Keycloak Operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure), also forward the Keycloak port:

```bash
kubectl port-forward svc/camunda-zeebe-gateway 26500:26500
kubectl port-forward svc/camunda-zeebe-gateway 8080:8080
```

```bash
# Only if using Keycloak
kubectl port-forward svc/keycloak-service 18080:18080
```

Now, you need to obtain both Zeebe and connectors' Operate OAuth clients. You can do it with `kubectl get secret camunda-zeebe-identity-secret -o jsonpath="{.data.*}" | base64 --decode`
and `kubectl get secret camunda-connectors-identity-secret -o jsonpath="{.data.*}" | base64 --decode` respectively.

Run the following command:

```shell
docker run --rm --name=CustomConnectorInSMWithHelm \
    -v $PWD/connector.jar:/opt/app/connector.jar \
    -e CAMUNDA_CLIENT_BROKER_GATEWAY-ADDRESS=host.docker.internal:26500 \
    -e CAMUNDA_CLIENT_SECURITY_PLAINTEXT=true \
    -e CAMUNDA_CLIENT_ID=zeebe \
    -e CAMUNDA_CLIENT_SECRET=<YOUR_CAMUNDA_CLIENT_SECRET> \
    -e ZEEBE_TOKEN_AUDIENCE=zeebe-api \
    -e ZEEBE_AUTHORIZATION_SERVER_URL=http://host.docker.internal:18080/auth/realms/camunda-platform/protocol/openid-connect/token \
    -e CAMUNDA_IDENTITY_TYPE=KEYCLOAK \
    -e CAMUNDA_IDENTITY_AUDIENCE=operate-api \
    -e CAMUNDA_IDENTITY_ISSUER_BACKEND_URL=http://host.docker.internal:18080/auth/realms/camunda-platform \
    -e CAMUNDA_IDENTITY_CLIENT_ID=connectors \
    -e CAMUNDA_IDENTITY_CLIENT_SECRET=<YOUR_OPERATE_CLIENT_SECRET> \
    -e CAMUNDA_OPERATE_CLIENT_URL=http://host.docker.internal:8081 \
        camunda/connectors-bundle:<desired-version>
```

**Note**
Exact values of the environment variables related to Zeebe, Operate, Keycloak, or network may depend on
your own configuration.

Interested in creating a custom connector? Review the related Camunda Academy courses on [creating a custom inbound connector](https://academy.camunda.com/c8-custom-inbound-connectors) or [creating a custom outbound connector](https://academy.camunda.com/c8-custom-outbound-connectors).

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/host-custom-connector
