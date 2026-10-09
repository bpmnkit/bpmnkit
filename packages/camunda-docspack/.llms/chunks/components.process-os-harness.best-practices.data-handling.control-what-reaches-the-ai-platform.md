# Handle project data safely — Control what reaches the AI platform

Your AI coding agent determines which AI platform is used and what it sends, so route that choice through the same review any other processor would get. Platforms such as Amazon Bedrock, Azure OpenAI, and Ollama are supported through the agent rather than by ProcessOS Harness directly.

Practical controls:

- **Keep secrets out of the project directory.** Credentials, tokens, and keys shouldn't be in files the agent can read. Generated workers reference configuration rather than embedding it.
- **Review the diff before you commit.** Skills stage changes in your working tree, which is your checkpoint for catching anything that shouldn't enter the repository.

---
Source: https://docs.camunda.io/docs/next/components/process-os-harness/best-practices/data-handling
