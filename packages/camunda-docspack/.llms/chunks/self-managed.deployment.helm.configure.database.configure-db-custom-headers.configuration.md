# Configure custom HTTP headers for database clients — Configuration

### Create the Java plugin

#### Add the dependency

Add the following dependency to a new Java project:

```xml
<dependency>
  <groupId>io.camunda</groupId>
  <artifactId>camunda-search-client-plugin</artifactId>
  <version>${version.camunda-search-client-plugin}</version>
  <scope>provided</scope>
</dependency>
```

```yml
implementation "io.camunda:camunda-search-client-plugin:${version.camunda-search-client-plugin}"
```

#### Write your custom header

After adding the dependency, create your plugin by implementing the `DatabaseCustomHeaderSupplier` interface provided by the `camunda-search-client-plugin` package.

The following example implements the `DatabaseCustomHeaderSupplier` interface, and returns a custom authentication token and UUID:

```java
package com.myplugin;

import io.camunda.plugin.search.header.CustomHeader;
import io.camunda.plugin.search.header.DatabaseCustomHeaderSupplier;
import java.util.UUID;

public class MyCustomHeaderPlugin implements DatabaseCustomHeaderSupplier {

  public static final String CUSTOM_TOKEN_PLUGIN = "X-Custom-Auth-Token";

  @Override
  public CustomHeader getSearchDatabaseCustomHeader() {
    return new CustomHeader(CUSTOM_TOKEN_PLUGIN, UUID.randomUUID().toString());
  }

}
```

#### Build your project

Build your project with all dependencies included, and copy the resulting JAR file to a location accessible by your Camunda installation. This JAR file will be required later during configuration.

**Note**
When building the project, the `camunda-search-client-plugin` dependency must have a scope of `provided`, otherwise there will be a class loader conflict between `camunda-search-client-plugin` classes loaded from different class paths.

The JVM treats `ClassA` loaded by `ClassLoaderA` as completely different from `ClassA` loaded by `ClassLoaderB`. Without a `provided` scope, this causes `does not implement` or `ClassCastException` errors.

### Add the plugin to your self-managed installation

To use your new plugin, add it to your Camunda 8 Self-Managed installation.

- **Mount the plugin**: For each container, mount your plugin JAR file inside the container's file system. For more information, see the [Docker](https://docs.docker.com/engine/storage/volumes/) or [Kubernetes](https://kubernetes.io/docs/concepts/storage/volumes/) documentation.

- **Configure components**: Include the plugin parameters in each component's `application.yaml`, or pass them to the component as environment variables. For more information, see how to [configure components using Helm charts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs).

### Example usage

The following examples add the new `my-plugin` JAR to the `application.yaml` for the Orchestration Cluster and Optimize:

#### Zeebe Exporter

```yaml
- ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_INTERCEPTORPLUGINS_0_ID=my-plugin
- ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_INTERCEPTORPLUGINS_0_CLASSNAME=com.myplugin.MyCustomHeaderPlugin
- ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_INTERCEPTORPLUGINS_0_JARPATH=/usr/local/plugin/plg.jar
```

#### Optimize Importer

**Note**
Due to technical limitations, Optimize currently allows registering up to five plugins.

```yaml
- CAMUNDA_OPTIMIZE_ELASTICSEARCH_INTERCEPTORPLUGINS_0_ID=my-plugin
- CAMUNDA_OPTIMIZE_ELASTICSEARCH_INTERCEPTORPLUGINS_0_CLASSNAME=com.myplugin.MyCustomHeaderPlugin
- CAMUNDA_OPTIMIZE_ELASTICSEARCH_INTERCEPTORPLUGINS_0_JARPATH=/usr/local/plugin/plg.jar
```

#### Zeebe Exporter

```yaml
- ZEEBE_BROKER_EXPORTERS_OPENSEARCH_ARGS_INTERCEPTORPLUGINS_0_ID=my-plugin
- ZEEBE_BROKER_EXPORTERS_OPENSEARCH_ARGS_INTERCEPTORPLUGINS_0_CLASSNAME=com.myplugin.MyCustomHeaderPlugin
- ZEEBE_BROKER_EXPORTERS_OPENSEARCH_ARGS_INTERCEPTORPLUGINS_0_JARPATH=/usr/local/plugin/plg.jar
```

#### Optimize Importer

**Note**
Due to technical limitations, Optimize currently allows registering up to five plugins.

```yaml
- CAMUNDA_OPTIMIZE_OPENSEARCH_INTERCEPTORPLUGINS_0_ID=my-plugin
- CAMUNDA_OPTIMIZE_OPENSEARCH_INTERCEPTORPLUGINS_0_CLASSNAME=com.myplugin.MyCustomHeaderPlugin
- CAMUNDA_OPTIMIZE_OPENSEARCH_INTERCEPTORPLUGINS_0_JARPATH=/usr/local/plugin/plg.jar
```

#### Zeebe Exporter

**Note**
The following configuration uses the default name `camundaExporter`. To use a custom name, update `CAMUNDAEXPORTER` in the provided environment variables to match the name defined in your exporter [configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter).

```yaml
- ZEEBE_BROKER_EXPORTERS_CAMUNDAEXPORTER_ARGS_CONNECT_INTERCEPTORPLUGINS_0_ID=my-plugin
- ZEEBE_BROKER_EXPORTERS_CAMUNDAEXPORTER_ARGS_CONNECT_INTERCEPTORPLUGINS_0_CLASSNAME=com.myplugin.MyCustomHeaderPlugin
- ZEEBE_BROKER_EXPORTERS_CAMUNDAEXPORTER_ARGS_CONNECT_INTERCEPTORPLUGINS_0_JARPATH=/usr/local/plugin/plg.jar
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/configure-db-custom-headers
