# Red Hat OpenShift — Pitfalls to avoid — scc

#### Restrictive SCCs

The following represents the most restrictive SCCs that can be used to deploy Camunda 8. Note that in OpenShift 4.10, these are equivalent to the built-in `restricted` SCCs (which are the default SCCs).

```yaml
Allow Privileged: false
Default Add Capabilities: <none>
Required Drop Capabilities: KILL, MKNOD, SYS_CHROOT, SETUID, SETGID
Allowed Capabilities: <none>
Allowed Seccomp Profiles: <none>
Allowed Volume Types: configMap, downwardAPI, emptyDir, persistentVolumeClaim, projected, secret
Allow Host Network: false
Allow Host Ports: false
Allow Host PID: false
Allow Host IPC: false
Read Only Root Filesystem: false
Run As User Strategy: MustRunAsRange
SELinux Context Strategy: MustRunAs
FSGroup Strategy: MustRunAs
Supplemental Groups Strategy: RunAsAny
```

When using these SCCs, be sure not to specify _any_ `runAsUser` or `fsGroup` values in either the pod or container security context. Instead, allow OpenShift to assign arbitrary IDs.

**Note**
If you are providing the ID ranges yourself, you can also configure the `runAsUser` and `fsGroup` values accordingly.

The Camunda Helm chart can be deployed to OpenShift with a few modifications, primarily revolving around your desired security context constraints.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
