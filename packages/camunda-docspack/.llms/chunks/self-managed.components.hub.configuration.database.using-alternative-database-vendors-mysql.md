# Database — Using alternative database vendors — MySQL

The MySQL driver is **not provided by default** in Camunda 8 distributions.  
You must download and provide it manually for the application to load.

1. Download the appropriate (platform-independent) MySQL driver:  
   [https://dev.mysql.com/downloads/connector/j/](https://dev.mysql.com/downloads/connector/j/)
2. If you are using Docker or Kubernetes, ensure that the folder with the library is properly mounted as a volume at this location:  
   `/driver-lib`. It will be automatically loaded by the application.

To use a custom database driver, set `SPRING_DATASOURCE_DRIVER_CLASS_NAME` to the fully qualified class name of your driver.  
Otherwise, omit this variable.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
