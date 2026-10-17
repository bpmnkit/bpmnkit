# Upgrade Camunda 8.9 to 8.10 using Helm — Migrate Web Modeler and Console to Camunda Hub — Migrate document-store cloud credentials

This migration applies only when a component uses credentials propagated from `global.documentStore.type.*` for a separate cloud integration. Configure replacement credentials only on each affected component. Don't copy document-store credentials to components that don't independently need cloud access. The migration applies when `global.documentStore.type.aws.enabled` or `global.documentStore.type.gcp.enabled` is `true`, or when `global.documentStore.activeStoreId` is `aws` or `gcp`. Chart 15.x emits no warning when these credentials disappear from a component.

**Note**
`optimize.env`, `camundaHub.restapi.env`, and `identity.env` support Helm's `tpl` templating (for example, `{{ .Release.Name }}`). `connectors.env` and every `<component>.envFrom` don't support `tpl` templating. The chart renders them as plain YAML.

For Camunda Hub, a list that you add under `camundaHub.restapi` replaces the matching `webModeler.restapi` list. Examples of such lists are `env`, `extraVolumes`, and `extraVolumeMounts`. Move your existing entries into the matching `camundaHub.restapi` list.

#### AWS - Static access key / secret key

**Connectors**: The default credentials chain of the AWS SDK uses these credentials for connector tasks (Lambda, SQS, SNS, DynamoDB, Bedrock, Textract).

```yaml
connectors:
  env:
    - name: AWS_ACCESS_KEY_ID
      valueFrom:
        secretKeyRef:
          name: connectors-aws-credentials
          key: accessKeyId
    - name: AWS_SECRET_ACCESS_KEY
      valueFrom:
        secretKeyRef:
          name: connectors-aws-credentials
          key: secretAccessKey
```

**Optimize**: Optimize signs AWS OpenSearch requests with these credentials when `optimize.database.opensearch.aws.enabled` is `true`. In 8.9, the chart also accepted `global.opensearch.aws.enabled`. Chart 15.x rejects this key.

```yaml
optimize:
  env:
    - name: AWS_ACCESS_KEY_ID
      valueFrom:
        secretKeyRef:
          name: optimize-aws-credentials
          key: accessKeyId
    - name: AWS_SECRET_ACCESS_KEY
      valueFrom:
        secretKeyRef:
          name: optimize-aws-credentials
          key: secretAccessKey
    - name: AWS_REGION
      valueFrom:
        secretKeyRef:
          name: optimize-aws-credentials
          key: region
```

**Note**
Optimize catches its credential resolution failures and silently uses Basic authentication instead. After you migrate, check the OpenSearch connection. Don't expect a startup error.

**Camunda Hub**:

```yaml
camundaHub:
  restapi:
    env:
      - name: AWS_ACCESS_KEY_ID
        valueFrom:
          secretKeyRef:
            name: camunda-hub-aws-credentials
            key: accessKeyId
      - name: AWS_SECRET_ACCESS_KEY
        valueFrom:
          secretKeyRef:
            name: camunda-hub-aws-credentials
            key: secretAccessKey
      - name: AWS_REGION
        valueFrom:
          secretKeyRef:
            name: camunda-hub-aws-credentials
            key: region
```

Any of the three components can load the variables at once through `envFrom` instead. This option works if the Secret's data keys already have the names `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. Optimize and Hub also need a data key named `AWS_REGION`.

```yaml
connectors: # (or optimize: / camundaHub.restapi:)
  envFrom:
    - secretRef:
        name: <component>-aws-credentials
```

#### AWS - IRSA

Annotate each component's own service account:

```yaml
connectors:
  serviceAccount:
    annotations:
      eks.amazonaws.com/role-arn: arn:aws:iam::<account-id>:role/connectors-role

optimize:
  serviceAccount:
    annotations:
      eks.amazonaws.com/role-arn: arn:aws:iam::<account-id>:role/optimize-role

camundaHub:
  serviceAccount:
    annotations:
      eks.amazonaws.com/role-arn: arn:aws:iam::<account-id>:role/camunda-hub-role
```

#### AWS - EKS Pod Identity

Create an EKS Pod Identity association for each component service account instead of the `eks.amazonaws.com/role-arn` annotation. With the default names, the service accounts are `<RELEASE>-connectors`, `<RELEASE>-optimize`, `<RELEASE>-identity`, and `<RELEASE>-web-modeler` for Camunda Hub. The Hub REST API and WebSockets pods share the `<RELEASE>-web-modeler` service account.

For both IRSA and EKS Pod Identity, set `AWS_REGION` explicitly for Optimize and Hub. EKS Pod Identity provides credentials but no region. The IRSA webhook injects only the region of the cluster. It injects this region only when the webhook has a region configured. Connectors doesn't need `AWS_REGION` because its element templates contain the region for each task.

#### GCP

**Connectors:**

The examples below use `gcp-credentials` as the Secret name. They expect the Secret's data key to have the name `service-account.json`. Replace `gcp-credentials` with the name of your Secret.

If your 8.9 `global.documentStore.type.gcp.secret.existingSecretKey` used another key, map that key to `service-account.json` with `secret.items`. Alternatively, update `GOOGLE_APPLICATION_CREDENTIALS` to the mounted filename. If you changed `global.documentStore.type.gcp.mountPath` or `global.documentStore.type.gcp.fileName`, use those values for `mountPath` and in `GOOGLE_APPLICATION_CREDENTIALS`.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
