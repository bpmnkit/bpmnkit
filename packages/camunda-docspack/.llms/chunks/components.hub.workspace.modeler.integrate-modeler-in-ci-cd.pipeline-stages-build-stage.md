# Integrate Camunda Hub into CI/CD — Pipeline stages — Build stage

While there is no distinct concept for a build package in Camunda 8, artifact structuring depends on your overall software architecture. The build stage should primarily focus on acquiring dependencies and deploying them to a preview environment.

#### Set up preview environments

Offering an automatically testable and review-ready process preview mandates a dedicated preview cluster. Numerous options exist, varying with software development lifecycle design, preferences, and Camunda 8 deployment type (SaaS, Self-Managed, or hybrid). This guide proposes a setup with lightweight local Self-Managed preview clusters (or embedded engines) and full-fledged staging and production clusters (Self-Managed or SaaS).

##### Using fully-featured clusters

For local preview environments, you can deploy a comprehensive [Zeebe](https://github.com/camunda/camunda) cluster including Operate and Tasklist. Options include using docker-compose or Kubernetes via Helm. All necessary endpoints and UIs are available for thorough process/application testing. Opt for a cluster version aligned with your production cluster to ensure process compatibility.

##### Using embedded Zeebe engines

If you don't need to spawn all apps such as Operate or Tasklist, you can use the lightweight [embedded Zeebe engine](https://github.com/camunda-community-hub/eze), which is a community-maintained project, to set up a cost-effective solution with an in-memory database. Together with the [Zeebe Hazelcast exporter](https://github.com/camunda-community-hub/zeebe-hazelcast-exporter) (community-maintained as well), you can consume data generated from your process for reporting or testing.

In the build stage, deploy your process or project to a cluster or embedded engine. Post-pipeline completion, such as deployment to staging or production, preview environments can be discarded.

**Tip**
For GitLab users, consider using [GitLab Review Apps](https://docs.gitlab.com/ee/ci/review_apps/) to provide preview environments.

Deploy resources using the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) in this pipeline step, compatible with both SaaS and Self-Managed clusters. Alternately, utilize the [Java](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started) client library or any [community-built alternatives](https://docs.camunda.io/docs/next/apis-tools/community-clients/index).

**Info: Feature branches and Camunda Hub installations**
To maintain a single source of truth, avoid multiple Camunda Hub instances for different feature branches. Instead, maintain a single Camunda Hub installation for all environments, utilizing versions to signify versioning and pipeline stages. Feature branches can be managed by cloning and merging files or projects, ensuring synchronization using VCS.

#### Automate deployment of linked resources/dependencies

Pipeline-driven deployment can be executed for a single file or an entire project. A separate system of record, maintained outside Camunda Hub, can handle finer-grained dependency management. Fetch the full project for a file using the `GET /api/v2/files/{fileKey}` endpoint to acquire the project's `projectKey`. Subsequently, use the `POST /api/v2/files/search` endpoint with the following payload to retrieve all project files:

```json title="POST /api/v2/files/search"
{
  "filter": {
    "projectKey": "56a98f55-7c53-4e7b-83b7-c58856ee39e4"
  },
  "page": {
    "from": 0,
    "limit": 50
  }
}
```

**Info**
All responses for `search` endpoints are paginated. Make sure you obtain all relevant pages.

To retrieve the actual file `content`, iterate over the response and fetch it via `GET /api/v2/files/{fileKey}`. Parse the XML of the diagram for the `zeebe:taskDefinition` tag to retrieve job worker types. Utilizing a job worker registry mapping, deploy these workers along with the process if required.

If you are running connectors in your process, you need to deploy the runtimes as well. Parse the process XML for `zeebe:taskDefinition` bindings to identify the necessary runtimes (in addition to job workers). To learn how to deploy connector runtimes, read more [here](https://docs.camunda.io/docs/next/self-managed/components/connectors/overview) for Self-Managed, or [here](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk#runtime-environments) for SaaS.

Deploy resources in this pipeline step using the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview), compatible with both SaaS and Self-Managed clusters. Alternatively, utilize the Java client library or any community-built alternatives.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/integrate-modeler-in-ci-cd
