# Cockpit plugin — Installation

1. **Download the latest release** from the [releases page](https://github.com/camunda/camunda-7-to-8-migration-tooling/releases).

2. **Deploy the plugin** to your Camunda 7 installation by copying the generated JAR file into the Camunda 7 plugins directory. For example the paths are:
   - For Tomcat: `./camunda-bpm-ee-tomcat-<camunda-7-version>-ee/server/apache-tomcat-<tomcat-version>/webapps/camunda/WEB-INF/lib/`.
   - For Run: `./camunda-bpm-run-ee-<camunda-7-version>-ee/configuration/userlib/`.

3. **Inspect skipped and migrated data in Cockpit** once the plugin has been deployed.


## Configuration

### Operate URL

When viewing migrated process instances, the plugin shows the Camunda 8 process instance key. You can optionally configure the Camunda 8 Operate URL so that these keys link directly to the corresponding process instance in Operate.

To configure this, create or edit the Cockpit configuration file (`config.js`) and add the `operateUrl` property:

```javascript
export default {
  operateUrl: "https://<your-operate-host>/operate",
};
```

Deploy this file to your Camunda 7 installation at `<camunda-webapp>/app/cockpit/scripts/config.js`.

If `operateUrl` is not configured, the Camunda 8 key is displayed as plain text without a link.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/cockpit-plugin
