# Run custom connectors in Helm charts

Deploy and run custom connectors in a Camunda Helm Kubernetes cluster.

You can deploy a custom connector in your Helm Kubernetes cluster along with the connectors bundle.

The default runtime loads connectors from the classpath using the Java Service Provider Interface (SPI). For the custom connectors, there is a dedicated folder
in the Connectors Docker image `/opt/custom`. Any JAR placed in this folder is included in the runtime classpath.

This page explains how to place your custom connector JAR in `/opt/custom`.


## Prerequisites

- A custom connector built as a **fat JAR** (JAR with dependencies).  
  For details on creating and building custom connectors, see [Connector SDK](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk).

  Example JAR name used in this guide:  
  `custom-connector-0.0.1-with-dependencies.jar`

- A hosting location accessible by Helm during installation.  
  Example path used in this guide:  
  `https://my.host:80/dist/custom-connector-0.0.1-with-dependencies.jar`

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/running-custom-connectors
