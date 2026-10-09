# Troubleshooting — General tips

- Enable verbose flow logs in ServiceNow  
  Navigate to **Flow Designer → Your flow name → Flow Reporting Settings** and enable full verbose logging to debug flow execution.

- Check Camunda Operate for connector errors  
  Inspect failed connector tasks in [Camunda Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction) for detailed error messages and variable mappings.

- Validate network connectivity  
  Ensure outbound calls between Camunda and ServiceNow are not blocked by firewalls, VPNs, or proxies.

- Check version compatibility  
  Verify that Camunda and ServiceNow versions meet the [prerequisites](https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/prerequisites).


## Frequently asked questions

**Do I need IntegrationHub Enterprise Pack for all connectors?**  
No. It is only required to start ServiceNow flows from Camunda using the Flow Starter connector.

**Why do I get 401 Unauthorized errors from ServiceNow?**  
This usually indicates a misconfigured OAuth profile. Verify the Client ID, Client Secret, and Token URL.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/troubleshooting
