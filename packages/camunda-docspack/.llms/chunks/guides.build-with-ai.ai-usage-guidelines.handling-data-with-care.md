# AI usage guidelines — Handling data with care

When using Camunda's AI services, you are submitting data, potentially including personal data, to AI models. The following requirements apply.

### Data minimization

Use as little data as necessary for your intended purpose. Where possible, use anonymized or pseudonymized data. If you need to use special categories of personal data (such as health data, biometric data, or data revealing racial or ethnic origin) or data relating to minors, ensure a lawful basis exists and, where required, complete a data protection impact assessment (DPIA) first.

### Retention and compliance

Follow applicable retention periods and deletion obligations. Ensure compliance with data subject rights and document data provenance, legal bases, and recipients as required by applicable data protection law.

### Confidential information

Do not include secrets, credentials, or confidential information in prompts, configurations, or any other input to AI services. This includes:

- API keys and passwords.
- Internal pricing or financial data.
- Product roadmaps.
- Confidential contracts or legal documents.

Only use data from approved, lawful sources, and comply with all applicable license, usage, and purpose limitation requirements.

### Security

Implement appropriate measures against prompt injection, data exfiltration, and service misuse. These risks are specific to AI systems and are worth addressing separately from your general application security practices.

---
Source: https://docs.camunda.io/docs/next/guides/build-with-ai/ai-usage-guidelines
