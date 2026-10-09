# Install Helm chart in air-gapped environments — Configuration — Push Docker images to a repository

Push all [required Docker images](#required-docker-images) to your repository:

1. Tag the image:

   ```shell
   docker tag <IMAGE_ID> example.jfrog.io/camunda/<DOCKER_IMAGE>:<DOCKER_TAG>
   ```

1. Push the image:

   ```shell
   docker push example.jfrog.io/camunda/<DOCKER_IMAGE>:<DOCKER_TAG>
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/registry-and-images/air-gapped-installation
