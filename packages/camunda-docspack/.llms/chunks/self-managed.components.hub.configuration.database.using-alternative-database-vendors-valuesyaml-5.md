# Database — Using alternative database vendors — valuesYaml

```yaml
camundaHub:
  restapi:
    externalDatabase:
      url: "jdbc:oracle:thin:@//[DB_HOST]:[DB_PORT]/[DB_NAME]"
      username: "[DB_USER]"
      secret:
        inlineSecret: "[DB_PASSWORD]"
    env:
      - name: SPRING_DATASOURCE_DRIVERCLASSNAME # Optional; omit to use default Oracle driver
        value: "[YOUR_CUSTOM_DRIVER]"
    extraVolumeMounts:
      - name: oracle-driver
        mountPath: /driver-lib
    extraVolumes:
      - name: oracle-driver
        emptyDir: {}
    initContainers:
      - name: fetch-jdbc-drivers
        image: alpine:3.22.1
        imagePullPolicy: "Always"
        command:
          [
            "sh",
            "-c",
            "wget https://download.oracle.com/otn-pub/otn_software/jdbc/237/ojdbc17.jar -O /driver-lib/ojdbc.jar",
          ]
        volumeMounts:
          - name: oracle-driver
            mountPath: /driver-lib
        securityContext:
          runAsUser: 1001
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
