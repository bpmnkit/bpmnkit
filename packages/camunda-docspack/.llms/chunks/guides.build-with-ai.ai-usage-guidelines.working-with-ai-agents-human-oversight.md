# AI usage guidelines — Working with AI agents — Human oversight

Maintain effective human oversight over any AI agent you deploy. This is also a sound operational principle; autonomous agents acting in production systems can have real-world consequences that are difficult to reverse.

At a minimum, human oversight means:

- Someone with the authority and technical ability to stop the agent at any time using a [kill switch](https://docs.camunda.io/docs/next/reference/glossary#kill-switch) or equivalent mechanism.
- Defined limits on what the agent can do. For example, caps on transaction amounts, action frequency, or which systems it can write to.
- A human approval step for any action with significant legal, financial, or safety implications.
- A regular review process so you can catch drift or unexpected behavior before it becomes a problem.

How you implement these controls is up to you. The right approach depends on your use case, your risk tolerance, and your existing operational processes. These guidelines do not prescribe a specific technical implementation.

---
Source: https://docs.camunda.io/docs/next/guides/build-with-ai/ai-usage-guidelines
