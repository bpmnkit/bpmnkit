# Troubleshooting Management Identity

Learn about solutions to common issues in Management Identity, such as complications connecting to Keycloak.

Troubleshoot common issues with Management Identity in a Self-Managed deployment.


## Management Identity pod crashloops/continually restarts

If the Management Identity pod crash loops, or the pod continually restarts, it is likely there is an issue with the Keycloak connection.

### Solution

1. Find the name of the Management Identity pod by running:

   ```
   kubectl get pods
   ```

   The output should look similar to:

   ```
   NAME                                      READY   STATUS    RESTARTS      AGE
   c8-local-identity-6fd96d59c4-8lzxv        1/1     Running   2 (24s ago)   85s
   c8-local-keycloak-0                       1/1     Running   0             30m
   c8-local-operate-69b765f7bb-hjcts         1/1     Running   0             30m
   c8-local-postgresql-0                     1/1     Running   0             30m
   c8-local-zeebe-0                          1/1     Running   0             30m
   c8-local-zeebe-gateway-678f4c7bfb-w8ght   1/1     Running   0             30m
   elasticsearch-master-0                    1/1     Running   0             30m
   ```

2. Using the pod name from the output above, view the logs:
   ```
   kubectl logs <POD_NAME>
   ```
3. Observe the most recent logs for an error message or stacktrace, for example:

   ```
   2022-07-04 15:52:04.250 ERROR 1 --- [main] i.c.i.i.k.config.KeycloakConfiguration   : Failure #1. Unable to connect to Keycloak.
   2022-07-04 15:52:09.252  WARN 1 --- [main] i.c.i.i.k.config.KeycloakConfiguration   : Retrying...
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/troubleshoot-identity
