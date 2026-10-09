# Red Hat OpenShift — Pitfalls to avoid — Security Context Constraints (SCCs)

[Security Context Constraints (SCCs)](https://docs.openshift.com/container-platform/latest/authentication/managing-security-context-constraints.html) are a set of conditions that a pod must adhere to in order to be accepted into the system. They define the security conditions under which a pod operates.

Similar to how roles control user permissions, SCCs regulate the permissions of deployed applications, both at the pod and container level. It's generally recommended to deploy applications with the most restrictive SCCs possible. If you're unfamiliar with security context constraints, you can refer to the [OpenShift documentation](https://docs.openshift.com/container-platform/latest/authentication/managing-security-context-constraints.html).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
