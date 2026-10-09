# Import resources into Camunda Hub — Troubleshoot — Why your resources might fail to import

You might not be able to import certain resources because they fail validation or cannot be processed.
These are common reasons:

- **Existing template**: A newer or equal version of the same template ID already exists, and the incoming template's contents are not available in your project.
- **Invalid file**: The file does not conform to the expected schema. For example, malformed element template JSON.
- **Network error**: Camunda Hub could not download the file from the given URL.
- **Only one README file allowed**: You cannot add additional README files because each project allows only a single README.
- **Too large**: The file exceeds Camunda Hub’s per‑file size limit.
- **Unknown error**: A generic error for unexpected failures.
- **Unrecognized file**: The file type is not supported by this version of Camunda Hub.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/importing-resources
