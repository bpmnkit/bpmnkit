# Manage credentials — Manage credentials in Hub — Environments only credentials

A credential created outside Hub, such as one created in Desktop Modeler or directly through the cluster API, exists on its cluster but is not tracked in Hub. The **Environments only** tab finds these credentials so you can bring them under Hub management.

The scan works per cluster, even though the tab lists environments. Each cluster appears once in the list, under the name of one of its environments.

1. Under **Environments**, select the environments you want to scan. You can scan up to 10 environments at a time.
2. Select **Scan environments**. Hub scans the cluster behind each selected environment for global variables that are tagged as credentials and that match a known credential type.
3. Select **Add to Hub** on a result to manage that credential in Hub. Hub reads the credential's configuration only when you open the **Add to Hub** dialog.

Adding a credential to Hub links it where it was found, without redeploying it, and records one environment on that cluster as its target, chosen for you rather than by you. Only the additional entries you select in the **Add to Hub** dialog are deployed to, again one environment for each cluster. Check the targets on the credential's detail page afterwards.

Select **Rescan environments** to run the scan again, for example after a credential is created outside Hub.

![Environments only tab of the Credentials page, with one environment selected, a paused environment that can't be selected, and a Scan environments button](./img/credentials-clusters-only.png)

If the scan returns no results, none of the clusters behind the environments you selected has a credential-tagged variable that matches a known credential type and version. Environments that are paused, or whose cluster runs a Camunda version without credential support, show a **Paused** or **Unsupported** badge and can't be scanned.

When there is nothing to find, Hub shows: "No environment-only credentials found. The scan did not find any unmanaged variables that match an exact known credential type and version."

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/index
