# Camunda components troubleshooting — Identity redirect URL

If HTTP to HTTPS redirection is enabled in the load-balancer or Ingress, make sure to use the HTTPS
protocol in the values file under `global.identity.auth.[COMPONENT].redirectUrl`.
Otherwise, you will get a redirection error in Keycloak.

For example:

```
global:
  identity:
    auth:
    operate
      redirectUrl: https://operate.example.com
```


## Zeebe Backup with S3

In general, some S3 compatible implementations are not able to properly handle the checksum feature of the S3 client being introduced with version 2.30.0. For more details, you can refer to [the AWS documentation](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/s3-checksums.html).

As soon as issues appear related to the checksum, it can be disabled by setting these environment variables on your Zeebe brokers:

```
AWS_REQUEST_CHECKSUM_CALCULATION=WHEN_REQUIRED
AWS_RESPONSE_CHECKSUM_CALCULATION=WHEN_REQUIRED
```

This will disable automated creation of checksums. If you are still encountering issues with MD5 checksums required by your provider, enable legacy support for the AWS S3 client by setting:

```
ZEEBE_BROKER_DATA_BACKUP_S3_SUPPORTLEGACYMD5=true
```

**Backups to IBM COS fail with 403 Access Denied**

When using an S3 backup store with IBM Cloud Object Storage, you may encounter `403 Access Denied` errors even though the access credentials are valid.
This may be caused by a [recent change in the AWS S3 client](https://docs.aws.amazon.com/sdkref/latest/guide/feature-dataintegrity.html), which now calculates checksums for data integrity by default. IBM COS does not appear to support this feature.

To resolve this issue, you can restore the previous behavior by setting the following environment variable on your Zeebe brokers:

```
AWS_REQUEST_CHECKSUM_CALCULATION=WHEN_REQUIRED
```

This will prevent the S3 client from calculating the additional checksums and should resolve the issue.

**Backups to Dell EMC ECS fail with 400 Bad Request**

When using an S3 backup store with Dell EMC ECS, you may encounter the following error:

`The Content-SHA256 you specified did not match what we received (Service: S3, Status Code: 400)`

This issue is caused by a recent change in the AWS S3 client, which now signs streaming chunked uploads differently. Dell EMC ECS does not support chunked encoding.

To resolve this issue, set the following environment variable on your Zeebe brokers:

```
AWS_REQUEST_CHECKSUM_CALCULATION=WHEN_REQUIRED
```

This disables the additional checksum calculation in the S3 client and should resolve the issue.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
