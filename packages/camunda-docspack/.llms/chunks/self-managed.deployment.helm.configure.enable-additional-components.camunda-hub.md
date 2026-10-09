# Enable additional Camunda components — Camunda Hub

Enable Camunda Hub with the following configuration options. If you're upgrading from Camunda 8.9, see the [Camunda Hub consolidation migration steps](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100#consolidate-console-and-web-modeler-into-camunda-hub).

- Set `camundaHub.enabled: true`.
- Enable Management Identity for authentication. See [authentication and authorization](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/index).
- Configure your SMTP server in `camundaHub.restapi.extraConfiguration`. Camunda Hub requires an SMTP server to send notification emails.
- Configure an external PostgreSQL connection under `camundaHub.restapi.externalDatabase`. Provision PostgreSQL externally, such as with a managed service or the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure).

We recommend specifying values in a YAML file and passing it to the `helm install` command.

Minimal configuration file:

```yaml
camundaHub:
  enabled: true
  restapi:
    mail:
      secret:
        existingSecret: "camunda-credentials-webmodeler"
        existingSecretKey: "webmodeler-smtp-user-password"
    externalDatabase:
      url: jdbc:postgresql://postgres.example.com:5432/modeler-db
      username: modeler-user
      secret:
        existingSecret: "camunda-credentials-webmodeler"
        existingSecretKey: "webmodeler-postgresql-user-password"
    extraConfiguration:
      - file: mail.yaml
        content: |
          spring:
            mail:
              host: smtp.example.com
              port: 587
              username: user
          camunda:
            modeler:
              mail:
                from-address: no-reply@example.com
```

For more details, see the [Camunda Hub Helm values](https://artifacthub.io/packages/helm/camunda/camunda-platform#camundahub-parameters).

**Note**
When using `kubectl port-forward` to log in to Camunda Hub with [Keycloak deployed via the Keycloak Operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure), you must also port-forward the Keycloak service so the OpenID Connect (OIDC) redirect works:

```bash
kubectl port-forward svc/keycloak-service 18080:18080
```

Alternatively, configure Identity with Ingress. See the [Ingress setup guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/enable-additional-components
