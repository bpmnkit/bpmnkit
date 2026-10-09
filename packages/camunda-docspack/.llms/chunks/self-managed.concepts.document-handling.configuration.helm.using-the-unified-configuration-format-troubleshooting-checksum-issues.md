# Document handling configuration in Helm — Using the unified configuration format — Troubleshooting checksum issues

Some S3-compatible implementations cannot properly handle the checksum feature of the S3 client introduced with version 2.30.0. For more details, refer to [the AWS documentation](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/s3-checksums.html).

If checksum-related errors appear, disable automated checksum creation by adding these environment variables under `orchestration.env` and `connectors.env`:

```yaml
orchestration:
  env:
    - name: AWS_REQUEST_CHECKSUM_CALCULATION
      value: WHEN_REQUIRED
    - name: AWS_RESPONSE_CHECKSUM_VALIDATION
      value: WHEN_REQUIRED

connectors:
  env:
    - name: AWS_REQUEST_CHECKSUM_CALCULATION
      value: WHEN_REQUIRED
    - name: AWS_RESPONSE_CHECKSUM_VALIDATION
      value: WHEN_REQUIRED
```

If you're still encountering issues with MD5 checksums required by your provider, enable legacy MD5 support by adding to the same `env` lists:

```yaml
orchestration:
  env:
    - name: DOCUMENT_STORE_AWS_SUPPORT_LEGACY_MD5
      value: "true"

connectors:
  env:
    - name: DOCUMENT_STORE_AWS_SUPPORT_LEGACY_MD5
      value: "true"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/helm
