# Handle project data safely — Where project data lives

| Location            | What's stored there                                                                  |
| ------------------- | ------------------------------------------------------------------------------------ |
| Your local machine  | The whole project, including sources, generated artifacts, and configuration.        |
| Your Git repository | Every committed artifact.                                                            |
| Camunda cluster     | Governance process state, including which phase you're in and pending SME questions. |
| AI platform         | The context your coding agent sends while running a skill.                           |

The AI platform is the boundary worth thinking about. Everything else stays inside infrastructure you already control, so your main decision is what the agent gets to read.

---
Source: https://docs.camunda.io/docs/next/components/process-os-harness/best-practices/data-handling
