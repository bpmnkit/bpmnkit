# RPA production setup — FAQ

**My RPA task is never picked up.**  
Ensure your RPA worker is connected to the correct Zeebe instance and has the correct [label](#labels) configured for the task.

**My first script run succeeds, but any subsequent runs fail. I always need to restart the machine.**  
Your script might not clean up properly. Use [teardown scripts](https://docs.camunda.io/docs/next/components/rpa/getting-started#incidents) to close apps after execution.

**How do I handle errors and exceptions within RPA scripts?**  
Use setup and teardown steps in the Robot Framework. Optionally, use `Throw BPMN Error` for BPMN-specific handling.

---
Source: https://docs.camunda.io/docs/next/components/rpa/production
