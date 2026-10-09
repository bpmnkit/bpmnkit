# Integrate Camunda Hub into CI/CD — Pipeline stages — Publish stage

Push approved changes to staging or production by deploying them to the respective clusters. You can use the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) to deploy via your pipeline, which works both for a SaaS or Self-Managed cluster.

#### Define authorizations

For clusters with [authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) enabled, use the Orchestration Cluster REST API to assign the necessary authorizations through the pipeline. This step ensures appropriate accessibility for process/application stakeholders or updating existing authorizations.

#### Monitoring and error handling

As with any CI/CD integration, it's crucial to set up monitoring and error handling mechanisms. These can include:

- Monitoring the CI/CD pipeline execution for errors and failures.
- Using Operate to catch incidents and send alerts to the pipeline in the test stage.
- Sending notifications or alerts in case of deployment issues in both the build and publish stages.
- Implementing rollback mechanisms in case a faulty BPMN diagram gets deployed.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/integrate-modeler-in-ci-cd
