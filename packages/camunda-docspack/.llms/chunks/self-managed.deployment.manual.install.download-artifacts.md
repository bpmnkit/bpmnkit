# Camunda manual installation — Download artifacts

Download the required Camunda 8 artifacts from the following sources. Make sure that all artifacts use the same minor version to ensure compatibility.

**Note: Artifactory authentication**
Downloading artifacts from [artifactory](https://artifacts.camunda.com) requires authentication. Use your Camunda Enterprise LDAP credentials.

When using `curl`, pass your username with the `-u` flag and let `curl` prompt for the password:

```sh
curl -u "$CAMUNDA_DISTRO_USER" -fL <url>
```

Orchestration Cluster:

- File names follow the pattern `camunda-zeebe-x.y.z.(zip|tar.gz)`.
- [Maven Central](https://central.sonatype.com/artifact/io.camunda/camunda-zeebe/versions) - Select a version, then click **Browse** to view downloadable files such as `.zip` or `.tar.gz`.
- [Artifactory](https://artifacts.camunda.com/ui/native/zeebe/io/camunda/camunda-zeebe/) - Select a version, then browse the files to download.
- [GitHub](https://github.com/camunda/camunda/releases) - Select a release to download the files.

Connectors:

- Bundle (includes pre-bundled connectors from Camunda)
  - File names follow the pattern `connector-runtime-bundle-x.y.z-with-dependencies.jar`.
  - Released bundle artifacts aren't available in Maven Central or Artifactory.

- Runtime-only
  - File names follow the pattern `connector-runtime-application-x.y.z.jar`.
  - Released runtime-only artifacts aren't available in Maven Central or Artifactory.

**Note**

Some out-of-the-box connectors are licensed under the [Camunda Self-Managed Free Edition license](https://camunda.com/legal/terms/cloud-terms-and-conditions/camunda-cloud-self-managed-free-edition-terms/). See [Camunda Connectors Bundle project](https://github.com/camunda/connectors) for an overview.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
