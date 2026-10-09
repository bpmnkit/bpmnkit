# OpenSearch exporter — Self-signed certificates

The Zeebe OpenSearch exporter does not [currently support](https://github.com/camunda/camunda/issues/9839) connecting to OpenSearch using self-signed certificates.
If you must use self-signed certificates, it is possible to build your own trust store and have the application use it.

In this case, it is recommended to create a new custom trust store based on the default one. This way, it will also be able to verify certificates signed using trusted root certificate authorities.

1.  First, create a new custom trust store which contains the same data as the default one, using PKCS12 format. To do so, find the
    location of the default `cacerts` trust store:
    - On Linux systems, find it at `$JAVA_HOME/lib/security/cacerts`.
    - For macOS, find it under `$(/usr/libexec/java_home)/jre/lib/security/cacerts`.

    Once you have the right location, for example, `$JAVA_HOME/lib/security/cacerts`, run the following to create a new trust store:

    ```sh
    keytool -importkeystore -srckeystore $JAVA_HOME/lib/security/cacerts -destkeystore zeebeTrustStore.jks -srcstoretype PKCS12 -deststoretype JKS
    ```

    Set any password, so long as it's at least 6 characters.

2.  Add your custom certificate to the new trust store. For example, if your custom certificate is located at `/tmp/myCustomCertificate.pem`:

    ```sh
    keytool -import -alias MyCustomCertificate -keystore zeebeTrustStore.jks -file /tmp/myCustomCertificate.pem
    ```

**Note**
    Replace the `-file` parameter with the actual path to your certificate, and make sure to replace the `-alias` parameter with something
    descriptive, like `WebServerCertificate`.

    When prompted to trust the certificate, make sure to answer **yes**.

3.  Update the application to use this trust store. First, make sure the file is readable by the application. For example, on Unix systems, run:

    ```sh
    chmod a+r zeebeTrustStore.jks
    ```

    Then, specify the following properties when running the application:
    - `javax.net.ssl.trustStore`: must be set to the path of your custom trust store.
    - `javax.net.ssl.trustStorePassword`: set to your trust store password.

    The following example uses a trust store location of `/tmp/zeebeTrustStore.jks`, and a password of `changeme`. When using the official distribution
    (whether Docker image or the bundled shell scripts), these propertiescan be provided using the following environment variable:

    ```sh
    JAVA_OPTS="-Djavax.net.ssl.trustStore=/tmp/zeebeTrustStore.jks -Djavax.net.ssl.trustStorePassword=changeme ${JAVA_OPTS}"
    ```

**Warning**
If you're using containers, you will need to mount the trust store to the container such that it can be found by the `java` process. This will depend on your deployment method (for example, Helm chart, Docker Compose). The simplest way is to build a custom image which already contains your trust store, and specifies the environment variable.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter
