# Flags — Examples

### Disable plug-ins

Start the modeler without activating installed plug-ins. This is useful to debug modeler errors.

### Single instance

By default, Desktop Modeler enforces single-instance mode, preventing more than one instance from running at a time. To run multiple instances simultaneously, pass `--no-single-instance` when starting the application.

### BPMN-only mode

To disable the DMN, Form, and RPA script editing capabilities of the App, configure your `flags.json` like this:

```js
{
    "disable-dmn": true,
    "disable-form": true
}
```

As a result, the app will only allow users to model BPMN diagrams.

![BPMN only mode](./img/bpmn-only.png)

### Disable `history-time-to-live` hint

Camunda 7 only

To disable the [history time to live](https://docs.camunda.org/manual/latest/modeler/history-time-to-live/) hint in scenarios where the engine configures HTTL, configure `flags.json`:

```js
{
    "disable-httl-hint": true
}
```

### Default `history-time-to-live`

Camunda 7 only

To set a default [history time to live](https://docs.camunda.org/manual/latest/modeler/history-time-to-live/) value to be used in newly created models, configure `flags.json`:

```js
{
    "default-httl": 30
}
```

### Custom `display-version` label

To display a custom version information in the status bar of the app, configure `flags.json`:

```js
{
    "display-version": "1.0.0"
}
```

![Custom version info](./img/display-version.png)

### Zeebe SSL certificate

Camunda 8 only

> :information_source: Modeler will read trusted certificates from your operating system's trust store.

Provide additional certificates to validate secured connections to a Camunda 8 installation.

Configure your `flags.json`:

```js
{
    "zeebe-ssl-certificate": "C:\\path\\to\\certs\\trusted-custom-roots.pem"
}
```

Additional information adapted from the [upstream documentation](https://nodejs.org/docs/latest/api/tls.html#tlscreatesecurecontextoptions):

> The peer (Camunda 8) certificate must be chainable to a CA trusted by the app for the connection to be authenticated. When using certificates that are not chainable to a well-known CA, the certificate's CA must be explicitly specified as trusted or the connection will fail to authenticate. If the peer uses a certificate that doesn't match or chain to one of the default CAs, provide a CA certificate that the peer's certificate can match or chain to. For self-signed certificates, the certificate is its own CA, and must be provided.

### Default execution platform version

This setting controls the [execution platform version](https://docs.camunda.io/docs/next/reference/glossary#execution-platform-version) used by Desktop Modeler. It does not change the version of a deployed cluster or process definition.

To change default execution platform version, configure your `flags.json` as follows:

```json
{
  "c7-engine-version": "7.18.0",
  "c8-engine-version": "8.0.0"
}
```

New diagrams created in Desktop Modeler will use the configured version instead of the latest stable version.

### Enable new context pad

To use the new context pad, configure your `flags.json` as follows:

```json
{
  "enable-new-context-pad": true
}
```

![New context pad](./img/new-context-pad.png)

### Disable connector templates

Camunda 8 only

To [disable automatic connector template fetching](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/use-connectors#automatic-connector-template-fetching), configure your `flags.json` as follows:

```json
{
  "disable-connector-templates": true
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/flags/flags
