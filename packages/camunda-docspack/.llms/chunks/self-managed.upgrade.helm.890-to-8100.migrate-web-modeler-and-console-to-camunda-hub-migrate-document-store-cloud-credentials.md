# Upgrade Camunda 8.9 to 8.10 using Helm — Migrate Web Modeler and Console to Camunda Hub — Migrate document-store cloud credentials

This migration applies only when a component relies on credentials propagated from `global.documentStore.type.*` for a separate cloud integration. Configure replacement credentials only on each affected component; don't copy document-store credentials to components that don't independently need cloud access. The warning appears when `global.documentStore.activeStoreId` is `aws` or `gcp`.

**Note**
`<component>.env` supports Helm's `tpl` templating (for example, `{{ .Release.Name }}`); `<component>.envFrom` does not - it is rendered as plain YAML.

#### AWS - Static access key / secret key

**Connectors** - used by the AWS SDK default credentials chain for connector tasks (Lambda, SQS, SNS, DynamoDB, Bedrock, Textract):

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
    - name: AWS_REGION
      valueFrom:
        secretKeyRef:
          name: connectors-aws-credentials
          key: region
```

**Optimize** - used to sign AWS OpenSearch requests when `global.opensearch.aws.enabled` (or `optimize.database.opensearch.aws.enabled`) is `true`:

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
Optimize's credential resolution failures are caught and silently fall back to Basic authentication - verify the OpenSearch connection after migrating rather than relying on a startup error.

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

Any of the three can load both keys at once via `envFrom` instead, if the secret's data keys are already named `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`:

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

Create an EKS Pod Identity association for each component service account instead of using the `eks.amazonaws.com/role-arn` annotation.

For both IRSA and EKS Pod Identity, set `AWS_REGION` explicitly for Optimize and Camunda Hub. The AWS identity integrations provide credentials, not the region. Connectors doesn't need `AWS_REGION` because its element templates carry the region per task.

#### GCP

**Connectors:**

The examples below use `gcp-credentials` as the Secret name and expect its data key to be named `service-account.json`. Replace the name with the Secret you use. If your 8.9 `global.documentStore.type.gcp.credentialsKey` used another key, map that key to `service-account.json` with `secret.items`, or update `GOOGLE_APPLICATION_CREDENTIALS` to the mounted filename.

```yaml
connectors:
  env:
    - name: GOOGLE_APPLICATION_CREDENTIALS
      value: /var/secrets/gcp/service-account.json
  extraVolumeMounts:
    - name: connectors-gcp-credentials
      mountPath: /var/secrets/gcp
      readOnly: true
  extraVolumes:
    - name: connectors-gcp-credentials
      secret:
        secretName: gcp-credentials
```

**Optimize:**

```yaml
optimize:
  env:
    - name: GOOGLE_APPLICATION_CREDENTIALS
      value: /var/secrets/gcp/service-account.json
  extraVolumeMounts:
    - name: optimize-gcp-credentials
      mountPath: /var/secrets/gcp
      readOnly: true
  extraVolumes:
    - name: optimize-gcp-credentials
      secret:
        secretName: gcp-credentials
```

**Camunda Hub REST API:**

```yaml
camundaHub:
  restapi:
    env:
      - name: GOOGLE_APPLICATION_CREDENTIALS
        value: /var/secrets/gcp/service-account.json
    extraVolumeMounts:
      - name: camunda-hub-gcp-credentials
        mountPath: /var/secrets/gcp
        readOnly: true
    extraVolumes:
      - name: camunda-hub-gcp-credentials
        secret:
          secretName: gcp-credentials
```

Workload Identity (GKE) is the annotation-based equivalent of IRSA, on `<component>.serviceAccount.annotations`:

```yaml
connectors: # (or optimize: / camundaHub:)
  serviceAccount:
    annotations:
      iam.gke.io/gcp-service-account: <gsa-name>@<project-id>.iam.gserviceaccount.com
```

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
