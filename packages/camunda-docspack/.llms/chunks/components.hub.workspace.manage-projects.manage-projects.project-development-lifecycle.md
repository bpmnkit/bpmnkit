# Projects — Project development lifecycle

In Camunda Hub, you can quickly develop project releases through the stages of a typical project development lifecycle:

For business-critical and higher-risk processes that require strict governance and/or quality requirements, you can [integrate Camunda Hub into your CI/CD pipelines](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/integrate-modeler-in-ci-cd).


## Known limitations

You should be aware of the following limitations when working with projects.

### Deployment limitations

- Projects can only be deployed to a Zeebe cluster in version 8.4.0 or higher.
- The overall size of the deployment bundle is limited due to a maximum [record](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/internal-processing) size of 4 MB in Zeebe.
  - The limit is effectively between 2 and 3 MB, as Zeebe writes more data to the log stream than just the raw deployment.
  - If you exceed the limit, you are shown an [error message](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project#deployment-errors):
    `Command 'CREATE' rejected with code 'EXCEEDED_BATCH_RECORD_SIZE'`.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/manage-projects
