# Web Modeler API — API reference

A detailed API description is available as [OpenAPI](https://www.openapis.org/) specification at [https://modeler.camunda.io/swagger-ui/index.html](https://modeler.camunda.io/swagger-ui/index.html)
for SaaS and at [http://localhost:8070/swagger-ui.html](http://localhost:8070/swagger-ui.html) for Self-Managed
installations.


## API in Postman

Work with this API in our [Postman collection](https://www.postman.com/camundateam/workspace/camunda-8-postman/collection/26079299-0bb668f4-af6a-4ab0-88a3-c78b900125ed?action=share&creator=11465105).


## Usage notes

When using Web Modeler API:

- You will not receive a warning when deleting a file, a folder, or a project.
  This is important, because deletion cannot be undone.
- You will not receive a warning about breaking call activity links or business rule task links when moving files or folders to another project.
  Breaking these links is considered harmless. The broken links can be manually removed or restored in Web Modeler. This operation is also
  reversible - simply move the files or folders back to their original location.

---
Source: https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/index
