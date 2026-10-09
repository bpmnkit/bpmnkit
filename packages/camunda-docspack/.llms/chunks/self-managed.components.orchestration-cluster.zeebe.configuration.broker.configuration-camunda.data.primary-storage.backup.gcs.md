# Broker configuration — Configuration — camunda.data.primary-storage.backup.gcs

Configure the following if store is set to GCS.

**Note**
The GCS backup strategy utilizes the [Google Cloud Storage REST API](https://cloud.google.com/storage/docs/request-endpoints).

**Note: Backup encryption**
There are multiple [data encryption options](https://cloud.google.com/storage/docs/encryption), some of which are supported by Zeebe:

- [Default server-side encryption](https://cloud.google.com/storage/docs/encryption/default-keys) is fully supported.
  This is enabled by default for all GCS buckets.
- [Customer-managed encryption keys](https://cloud.google.com/storage/docs/encryption/customer-managed-keys) are supported if they are [set as
  the default key](https://cloud.google.com/storage/docs/encryption/using-customer-managed-keys#set-default-key) for your bucket.
- [Customer-supplied encryption keys](https://cloud.google.com/storage/docs/encryption/customer-supplied-keys) are not supported.
- [Client-side encryption keys](https://cloud.google.com/storage/docs/encryption/client-side-keys) are not supported.

| Field       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Example Value |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| bucket-name | Name of the bucket where the backup will be stored. The bucket **must already exist**. The bucket must not be shared with other Zeebe clusters unless `base-path` is also set. Zeebe checks at startup that the specified bucket exists and can be accessed, and logs at WARN level if the bucket does not exist. This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_GCS_BUCKETNAME`.                                                                                                                                                                                                                                   |               |
| base-path   | When set, all blobs in the bucket use this prefix. Useful for using the same bucket for multiple Zeebe clusters. In this case, `base-path` must be unique. Should not start or end with `/`. Must be non-empty and not consist only of `/` characters. See [Google documentation on naming](https://cloud.google.com/storage/docs/objects#naming). This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_GCS_BASEPATH`.                                                                                                                                                                                                    |               |
| endpoint    | Configure the endpoint for the GCS backup store. This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_GCS_ENDPOINT`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |               |
| host        | When set, this overrides the host that the GCS client connects to. By default, this is not set because the client can automatically discover the correct host to connect to. This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_GCS_HOST`.                                                                                                                                                                                                                                                                                                                                                                              |               |
| auth        | Configures which authentication method is used for connecting to GCS. Can be either `auto` or `none`. Choosing `auto` means that the GCS client uses application default credentials, which automatically discover appropriate credentials from the runtime environment: [https://cloud.google.com/docs/authentication/application-default-credentials](https://cloud.google.com/docs/authentication/application-default-credentials). Choosing `none` means that no authentication is attempted, which is only applicable for testing with emulated GCS. This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_GCS_AUTH`. | auto          |

#### YAML snippet

```yaml
camunda:
  data:
    primary-storage:
      backup:
        store: GCS
        gcs:
          bucket-name: null
          base-path: null
          endpoint: null
          host: null
          auth: auto
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
