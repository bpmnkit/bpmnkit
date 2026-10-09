# Integrate Camunda Hub into CI/CD — Setup

**Tip: CI/CD pipeline process blueprint**

The Camunda Marketplace offers a customizable [process blueprint for CI/CD pipelines](https://marketplace.camunda.com/en-US/apps/439170/cicd-pipeline) to streamline the setup process described below.
This blueprint provides a ready-to-use proof of concept for a CI/CD pipeline for Camunda Hub, enabling you to synchronize Camunda Hub files to GitLab and deploy them across different environments.

While a pipeline for project integration and deployment resembles general software CI/CD pipelines, key distinctions exist. Consider the following:

- Camunda Hub uses [versions](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/versions) to indicate specific process states, such as readiness for developer handover, review, or deployment.
- A project comprises diverse resources, such as processes, subprocesses, forms, DMN decision models, connectors, job workers, and orchestrated services. Some projects bundle these resources, while others focus on a single process for deployment.
- Process reviews differ from code reviews, occurring on visual diagrams rather than XML.

![Sample CI/CD setup with Camunda Hub](img/modeler-ci-cd.png)

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/integrate-modeler-in-ci-cd
