# Upgrade Zeebe — Rolling update — Using Helm

If your Zeebe deployment is managed by our [Helm charts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install), the rolling update procedure is already automated.

**Note**
Zeebe brokers are managed by a [`StatefulSet`](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#update-strategies). Zeebe Gateways are managed by a [`Deployment`](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#updating-a-deployment).

#### Upgrading brokers

Ensure the `StatefulSet` for brokers is ready to do a rolling update by checking that:

- The update strategy is `RollingUpdate`.
- All replicas are ready.
- The version is at least 8.5.0.

The following is an example how to verify these properties.
Depending on your environment, you may have to adjust these commands slightly.

```
$ kubectl get statefulsets -l app.kubernetes.io/component=zeebe-broker -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.updateStrategy.type}{"\n"}{end}'
camunda-platform-zeebe  RollingUpdate
$ kubectl rollout status statefulset -l app.kubernetes.io/component=zeebe-broker
statefulset rolling update complete 3 pods at revision camunda-platform-zeebe-d69689fbc...
$ kubectl get services -l app.kubernetes.io/component=zeebe-gateway
NAME                             TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                       AGE
camunda-platform-zeebe-gateway   ClusterIP   10.96.227.153   <none>        9600/TCP,26500/TCP,8080/TCP   21m
$ kubectl port-forward services/camunda-platform-zeebe-gateway -p 8080:8080 &
$ curl localhost:8080/v2/topology | jq .brokers[].version && kill %1
8.5.0
8.5.0
8.5.0
```

To start the rolling update, upgrade the Helm deployment to use a new version of Zeebe.
Set `$NEW_ZEEBE_VERSION` to the version you want to upgrade to, for example `8.5.2`.
Remember to read the [upgrade guide](https://docs.camunda.io/docs/next/self-managed/upgrade/components/index) to check for known issues.
Then, start the rolling update with `helm upgrade`.

```
$ export $NEW_ZEEBE_VERSION=8.5.2
$ helm upgrade camunda-platform camunda/camunda-platform --reuse-values --set zeebe.image.tag=$NEW_ZEEBE_VERSION
```

Then, wait for the rolling update to complete:

```
$ kubectl rollout status statefulset -l app.kubernetes.io/component=zeebe-broker
Waiting for 3 pods to be ready...
Waiting for 2 pods to be ready...
Waiting for 1 pods to be ready...
statefulset rolling update complete 3 pods at revision camunda-platform-zeebe-5b7f7d6477...
```

When the command finishes, all Zeebe brokers are upgraded to the new version and should be ready.
We can verify this by running the command to check versions again:

```shell
$ kubectl port-forward services/camunda-platform-zeebe-gateway -p 8080:8080 &
$ curl localhost:8080/v2/topology | jq .brokers[].version && kill %1
8.5.2
8.5.2
8.5.2
```

#### Upgrading gateways

Ensure the deployment of gateways is ready to do a rolling update by checking that:

- All replicas are ready.
- The version is at least 8.5.

You can use the following command to verify this:

```
$ kubectl rollout status statefulset -l app.kubernetes.io/component=zeebe-gateway
NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
camunda-platform-zeebe-gateway   2/2     2            2           4h25m
```

Then, upgrade the version via Helm:

```
$ helm upgrade camunda-platform camunda/camunda-platform --reuse-values --set zeebe-gateway.image.tag=$NEW_ZEEBE_VERSION
```

Wait for the upgrade to complete:

```
$ kubectl rollout status -l app.kubernetes.io/component=zeebe-gateway
```

At this point, both brokers and gateways are upgraded.
Your client applications are ready to be upgraded as well and can start using features added in the new version.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/update-zeebe
