# Integrate Camunda Hub into CI/CD — FAQ

#### Can I do blue-green deployments on Camunda 8?

Blue-green deployments are possible with Camunda 8 with limitations. While switching clusters is quick for new process instances, audit logs and existing process instances remain tied to the previous cluster. Consider exporting audit logs from Elasticsearch or OpenSearch to your own streams if needed. If you don't have to migrate running process instances, keeping them running on the previous cluster alongside new instances on the new cluster is also an option.

#### Can I implement blue-green deployments with Camunda 8 SaaS?

While blue-green deployments are more straightforward with Self-Managed setups, you can implement similar deployment strategies with Camunda 8 SaaS. Keep in mind the limitations and differences between clusters when planning your deployment approach.

#### How can I prevent manual deployments from Camunda Hub?

To enforce CI/CD pipelines and restrict manual deployments, you can disable manual deployments. For Self-Managed setups, set environment variables `ZEEBE_BPMN_DEPLOYMENT_ENABLED` and `ZEEBE_DMN_DEPLOYMENT_ENABLED`. In Camunda 8 SaaS, manage deployment permissions via [user roles](https://docs.camunda.io/docs/next/components/hub/organization/manage-users/index).

#### How can I sync files between Camunda Hub and version control?

Use the Camunda Hub API's CRUD operations to sync files between Camunda Hub and your version control system. Consider maintaining a second system of record to map Camunda Hub projects to VCS repositories and track sync/update dates.

#### How do I listen to version creation in Camunda Hub?

Currently, you need to poll for version creations using the `POST /api/v2/versions/search` endpoint of the Camunda Hub API. Compare the `created` date of versions with your last sync date to identify newly created versions.

#### What is the purpose of the build stage in my pipeline?

The build stage focuses on preparing dependencies and deploying them to a preview environment. This environment provides a preview of your process that can be tested and reviewed by team members.

#### Can I lint my process diagrams for verification?

Yes, you can use the `bpmnlint` and `dmnlint` libraries to automatically verify your process diagrams against predefined rules. These libraries provide reporting capabilities to identify and fix issues during the build stage.

#### How can I perform unit and integration tests on my processes?

You can use [Camunda Process Test](https://docs.camunda.io/docs/next/apis-tools/testing/getting-started) for Java-based unit and integration tests, or community-built clients for other programming languages. These libraries allow you to execute your BPMN and DMN diagrams with assertions in your development or preview environments.

#### How do I provide environment variables to connectors in preview environments?

You can manage environment variables for connectors using secrets. This can be set up in both Camunda 8 SaaS and Self-Managed. Refer to the [Connectors configuration documentation](https://docs.camunda.io/docs/next/components/connectors/introduction) for details.

#### How can I monitor and handle errors in my CI/CD pipeline?

Implement monitoring mechanisms in your CI/CD pipeline to catch errors and failures during the deployment process. Additionally, consider implementing rollback mechanisms in case a faulty BPMN diagram is deployed.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/integrate-modeler-in-ci-cd
