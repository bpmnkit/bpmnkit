# Deploy to Amazon ECS — Deploy Camunda Hub — Use the private Camunda registry

The default images pull from public Docker Hub and need no credentials. To use the private enterprise images, point `camunda_hub_restapi_image` and `camunda_hub_websockets_image` at `registry.camunda.cloud` and set `registry_username` and `registry_password`. Registry credentials are attached to the task only when an image targets that private registry.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
