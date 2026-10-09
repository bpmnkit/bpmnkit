# Troubleshoot database connection issues — IAM authentication against Amazon Aurora fails

You switched from standard username/password authentication to IAM authentication and Camunda Hub can't obtain a connection to the database.

### Ensure the IAM account has all privileges to the Camunda Hub database

After switching from standard username/password authentication to IAM authentication, privileges to Camunda Hub's
database might still be associated with the old username.
Ensure the IAM account has all privileges to the Camunda Hub database.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-database-connection
