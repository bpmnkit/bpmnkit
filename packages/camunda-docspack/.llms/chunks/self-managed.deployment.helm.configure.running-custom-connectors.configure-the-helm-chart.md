# Run custom connectors in Helm charts — Configure the Helm chart

Update the values of the [Camunda Helm charts](https://artifacthub.io/packages/helm/camunda/camunda-platform#parameters) to download the JAR into `/opt/custom` before the connectors runtime starts:

```yaml
connectors:
  initContainers:
    - name: init-script-downloader
      image: appropriate/curl
      securityContext:
        runAsUser: 1000
        runAsNonRoot: true
      args:
        - "-o"
        - "/opt/custom/custom-connector-0.0.1-with-dependencies.jar"
        - "https://my.host:80/dist/custom-connector-0.0.1-with-dependencies.jar"
      volumeMounts:
        - name: init-script
          mountPath: /opt/custom

  extraVolumes:
    - name: init-script
      emptyDir: {}

  extraVolumeMounts:
    - mountPath: /opt/custom/custom-connector-0.0.1-with-dependencies.jar
      name: init-script
      subPath: custom-connector-0.0.1-with-dependencies.jar
```

After updating the values, run [Helm install](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install#install-camunda-helm-chart) as usual.

**Note**
The `appropriate/curl` image is not the only image option for the `initContainers`. You can use other `curl`-based images, such as `curlimages/curl`. Adjust the `args` to match the image you choose.

On clusters that enforce non-root containers (for example, restricted Pod Security admission), keep the `securityContext` in the init container to avoid startup failures.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/running-custom-connectors
