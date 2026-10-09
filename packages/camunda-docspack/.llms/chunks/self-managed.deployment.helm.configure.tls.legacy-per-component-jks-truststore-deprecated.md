# Configure TLS — Legacy: per-component JKS truststore (deprecated)

The `global.elasticsearch.*` and `global.opensearch.*` trees were removed in chart 15.x, including their `tls.secret.*` and `tls.jks.secret.*` password-injection blocks. Setting any key under them fails the render. See the [8.9 to 8.10 upgrade guide](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100#migrate-globalelasticsearch-and-globalopensearch) for the migration mapping.

The following per-component fields still work in chart 15.x, but are deprecated:

- `orchestration.data.secondaryStorage.elasticsearch.tls.secret.*`
- `orchestration.data.secondaryStorage.opensearch.tls.secret.*`
- `optimize.database.elasticsearch.tls.secret.*`
- `optimize.database.opensearch.tls.secret.*`

If a legacy JKS field and `global.tls.caBundle` are both set, the legacy field takes precedence. To migrate:

1. Convert JKS to PEM:
   ```bash
   keytool -list -keystore your.jks -storepass changeit -rfc \
     | awk '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/' \
     > your-ca-bundle.pem
   ```
2. Create the `camunda-ca-bundle` Secret as in [step 1](#1-create-the-ca-bundle-secret).
3. Remove all `*.tls.secret.existingSecret` / `*.tls.jks.*` entries from your values file.
4. Remove `-Djavax.net.ssl.trustStore…` and `-Djavax.net.ssl.trustStoreType=jks` from `javaOpts`.
5. Run `helm upgrade` with `-f values-tls.yaml`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls
