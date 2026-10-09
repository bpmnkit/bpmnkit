# Database — Configuring SSL for the database connection

To configure SSL between Camunda Hub and the database:

- Modify the JDBC URL using `SPRING_DATASOURCE_URL` and add connection parameters.
- Provide SSL certificates and keys to the `restapi` component, if required.

Consult the [PostgreSQL documentation](https://jdbc.postgresql.org/documentation/ssl/) for details on SSL modes and their security guarantees.  
For a full list of available connection parameters, see the [PostgreSQL connection parameters reference](https://jdbc.postgresql.org/documentation/use/#connection-parameters/).

Below are examples for common SSL configurations, ordered by increasing security.

### SSL mode `require`

An SSL connection is established, but this mode remains vulnerable to person-in-the-middle attacks.

Modify the JDBC URL as follows:

```bash
jdbc:postgresql://[DB_HOST]:[DB_PORT]/[DB_NAME]?sslmode=require
```

No certificates are required for this mode.

### SSL mode `verify-full`

Camunda Hub verifies the server’s identity by checking its certificate.  
This mode prevents person-in-the-middle attacks.

1. Provide the root certificate that signed the server certificate:  
   `myCA.crt -> ~/.postgresql/root.crt`
2. Modify the JDBC URL:

```bash
   jdbc:postgresql://[DB_HOST]:[DB_PORT]/[DB_NAME]?sslmode=verify-full
```

### SSL mode `verify-full` with client certificates

In this mode, both the server and Camunda Hub authenticate each other using certificates.

1. Mount client certificates:
   - `myClientCertificate.pk8 -> ~/.postgresql/postgresql.pk8`
   - `myClientCertificate.crt -> ~/.postgresql/postgresql.crt`
2. Provide the root certificate:  
   `myCA.crt -> ~/.postgresql/root.crt`
3. Modify the JDBC URL:
   ```bash
   jdbc:postgresql://[DB_HOST]:[DB_PORT]/[DB_NAME]?sslmode=verify-full
   ```
4. Configure the database server to verify client certificates. See the [PostgreSQL SSL documentation](https://www.postgresql.org/docs/current/ssl-tcp.html).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database
