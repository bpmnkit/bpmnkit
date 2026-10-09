# Prepare Identity for production

Consider the following topics when moving Identity into a production environment.

When moving Identity to a production environment, you should consider the following.


## Keycloak dependency

As Keycloak is an external-based dependency of Identity, Camunda recommends looking at [Keycloak's documentation on production configuration](https://www.keycloak.org/server/configuration-production) to ensure your Keycloak instance is production-ready.

### Backing up

To ensure recovery is possible, Camunda recommends regularly backing up the database that supports Keycloak.

#### Helm deployment

If you deployed Camunda 8 using Camunda [Helm charts](https://docs.camunda.io/docs/next/self-managed/setup/overview), by default there will be a Postgres database deployed with it. In this case, Camunda recommends reading the [Postgres documentation](https://www.postgresql.org/docs/current/backup.html) for guidance on backing up.

#### Alternative deployment

If your Keycloak service uses a different database provider than Postgres, Camunda recommends referencing the backup section of the documentation for your chosen provider and version.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/making-identity-production-ready
