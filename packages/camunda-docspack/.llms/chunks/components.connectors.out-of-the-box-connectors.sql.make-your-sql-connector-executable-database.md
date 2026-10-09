# SQL connector — Make your SQL connector executable — Database

Select the database type you want to connect to. The **SQL connector** supports the following databases:

- MariaDB
- Microsoft SQL Server
- MySQL
- PostgreSQL
- **Oracle:** (See note below.)

**Note**
The Oracle Database connector requires the Oracle JDBC driver, which Camunda cannot distribute due to licensing restrictions. To connect to an Oracle database, you must manually download the JDBC driver from [Oracle](https://www.oracle.com/database/technologies/appdev/jdbc-downloads.html) and run the connector in [hybrid mode](https://docs.camunda.io/docs/next/components/connectors/use-connectors-in-hybrid-mode). When building a custom Docker image, include the driver by copying it into the image—for example, add `COPY ojdbc17.jar /opt/custom/` to your Dockerfile. This ensures the driver is on the classpath when the connector runtime starts.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/sql
