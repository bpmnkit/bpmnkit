# Red Hat OpenShift Dual-Region — Setup Advanced Cluster Management and Submariner — Submariner (2)

If everything is set up correctly, you should observe in the output of each cluster context the following statuses:
   - Gateway's status: `All connections (1) are established`
   - Connection's status: `connected   10.406614ms (RTT)`

    
      Example Submariner check successful output

   ```text reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/submariner/output.txt
   ```

    

For more comprehensive details regarding the verification tests for Submariner using subctl, please refer to the [official documentation](https://submariner.io/operations/deployment/subctl/#verify).

**Debugging the Submariner setup:**

If you are experiencing connectivity issues, we recommend spawning a pod in the `default` namespace that contains networking debugging tools. You can find an [example here](https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/submariner/debug-utils-submariner.yml).
With this pod, you will be able to check flow openings, service resolution, and other network-related aspects.
Troubleshooting requires examining all the underlying mechanisms of Submariner. Therefore, we also encourage you to read the [Submariner troubleshooting guide](https://submariner.io/operations/troubleshooting/).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
