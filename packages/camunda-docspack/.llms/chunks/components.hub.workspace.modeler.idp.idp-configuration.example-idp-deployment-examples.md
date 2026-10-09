# Configure IDP — Example IDP deployment {#examples}

The following examples show how you can deploy and configure IDP in your local development environment.

### Camunda 8 Run {#idp-c8run-example}

To use [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run) to deploy and run Camunda 8 with IDP in a local development environment:

1. Ensure you have completed the IDP [Amazon Web Services (AWS) prerequisites](#prerequisites) and have obtained your AWS [access key pair](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) (_access key_ and _secret access key_).

1. [Install Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/install-start#install-and-start-camunda-8-run). For example, download the latest release of Camunda 8 Run for your operating system and architecture and open the .tgz file to extract the Camunda 8 Run script into a new directory.

1. Navigate to the `docker-compose-8.x` folder in the new c8run directory.
   1. Open the `connector-secrets.txt` file, and add your AWS connector secrets.

      For example:

      ```
      IDP_AWS_ACCESSKEY=AWSACCESSKEYID
      IDP_AWS_SECRETKEY=AWSSECRETACCESSKEYGOESHERE
      IDP_AWS_REGION=us-east-1
      IDP_AWS_BUCKET_NAME=idp-extraction-connector
      ```

   1. Save and close the file.

   1. Configure [document handling environment variables](https://docs.camunda.io/docs/next/components/document-handling/getting-started) for the Tasklist and Zeebe components (for example, in the `.env` file).

1. Start Camunda 8 with Docker Compose. For example, run `docker compose up -d` in that directory.

1. Launch Camunda Hub at http://localhost:8070 and log in with the username `demo` and password `demo`.
1. Get started with IDP by creating a new [IDP project](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-projects) in Camunda Hub.

**Info**
To learn more about Docker Compose configurations and commands for local development, see [Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose).

### Docker {#idp-docker-example}

To use [Docker](https://docs.camunda.io/docs/next/self-managed/deployment/docker/docker) to deploy and run Camunda 8 with IDP in a local development environment:

1. Ensure you have completed the IDP [Amazon Web Services (AWS) prerequisites](#prerequisites) and have obtained your AWS [access key pair](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) (_access key_ and _secret access key_).

1. Download the latest Camunda Docker Compose release artifact from the [camunda-distributions](https://github.com/camunda/camunda-distributions/releases) GitHub repository, and extract the file contents to your desired directory.
1. In the extracted directory:
   1. Open the `connector-secrets.txt` file, and add your AWS connector secrets.

      For example:

      ```
      IDP_AWS_ACCESSKEY=AWSACCESSKEYID
      IDP_AWS_SECRETKEY=AWSSECRETACCESSKEYGOESHERE
      IDP_AWS_REGION=us-east-1
      IDP_AWS_BUCKET_NAME=idp-extraction-connector
      ```

   1. Save and close the file.

1. Configure [document handling environment variables](https://docs.camunda.io/docs/next/components/document-handling/getting-started) for the Tasklist and Zeebe components.
1. [Configure Docker Compose environments](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/configuration#choose-a-docker-compose-configuration). For example, run the full configuration in the extracted directory:

   ```
   docker compose -f docker-compose-full.yaml up -d
   ```

1. Launch Camunda Hub at http://localhost:8070 and log in with the username `demo` and password `demo`.
1. Get started with IDP by creating a new [IDP project](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-projects) in Camunda Hub.

**Info**
To learn more about using Docker Compose to run Camunda Self-Managed locally, see [Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration
