/**
 * A short, stable name for each bundled connector template, and the dropdowns
 * that choose its operation. Both are what a model writes and reads in
 * generation (`slack chat.postMessage`), so they are written down here rather
 * than derived: a template renamed upstream must not change what an old
 * answer means.
 *
 * Tests check that every bundled template has an entry, that aliases are
 * unique, and that every listed dropdown exists. A template added by
 * `pnpm update-connectors` fails that test until it is given an alias here.
 *
 * `operations` lists the dropdowns, outermost first, whose choices make
 * separate operations (GitHub's `operationGroup`, then `issueOperationType`).
 * Dropdowns not listed (authentication type, AI provider) are modes of one
 * operation, not operations. A template without `operations` has one.
 */
export const CONNECTOR_ALIASES: Readonly<
	Record<string, { alias: string; operations?: readonly string[] }>
> = {
	"io.camunda.connectors.agenticai.a2a.client.v0": { alias: "a2a" },
	"io.camunda.connectors.agenticai.a2a.client.polling.intermediate.v0": {
		alias: "a2a-polling-catch",
	},
	"io.camunda.connectors.agenticai.a2a.client.polling.receive.v0": { alias: "a2a-polling-receive" },
	"io.camunda.connectors.agenticai.a2a.client.webhook.intermediate.v0": {
		alias: "a2a-webhook-catch",
	},
	"io.camunda.connectors.agenticai.a2a.client.webhook.receive.v0": { alias: "a2a-webhook-receive" },
	"io.camunda.connectors.agenticai.adhoctoolsschema.v1": { alias: "adhoc-tools-schema" },
	"io.camunda.connectors.agenticai.adhoctoolsschema.v0": { alias: "adhoc-tools-schema-v0" },
	"io.camunda.connectors.agenticai.ai-agent-task.v2": { alias: "ai-agent" },
	"io.camunda.connectors.agenticai.ai-agent-subprocess.v2": { alias: "ai-agent-subprocess" },
	"io.camunda.connectors.agenticai.aiagent.jobworker.v1": { alias: "ai-agent-subprocess-v1" },
	"io.camunda.connectors.agenticai.aiagent.v0": { alias: "ai-agent-v0" },
	"io.camunda.connectors.agenticai.aiagent.v1": { alias: "ai-agent-v1" },
	"io.camunda.connectors.AppIntegrationsChat.Boundary.v1": { alias: "app-chat-boundary" },
	"io.camunda.connectors.AppIntegrationsChat.Intermediate.v1": { alias: "app-chat-catch" },
	"io.camunda.connectors.AppIntegrationsChat.Receive.v1": { alias: "app-chat-receive" },
	"io.camunda.connectors.AppIntegrationsChat.Start.v1": { alias: "app-chat-start" },
	"io.camunda.connectors.AppIntegrations.v1": {
		alias: "app-integrations",
		operations: ["operation"],
	},
	"io.camunda.connectors.Asana.v1": {
		alias: "asana",
		operations: ["operationGroup", "taskOperation", "projectOperation"],
	},
	"io.camunda.connectors.AutomationAnywhere.v1": {
		alias: "automation-anywhere",
		operations: ["operationType"],
	},
	"io.camunda.connectors.AutomationAnywhere": {
		alias: "automation-anywhere-legacy",
		operations: ["operation.type"],
	},
	"io.camunda.connectors.azure.blobstorage.v1": {
		alias: "azure-blob",
		operations: ["operationDiscriminator"],
	},
	"io.camunda.connectors.AzureOpenAI.outbound.v1": {
		alias: "azure-openai",
		operations: ["operation"],
	},
	"io.camunda.connectors.aws.bedrock.v1": { alias: "bedrock", operations: ["action"] },
	"io.camunda.connectors.aws.bedrock.agentcore.runtime.v1": { alias: "bedrock-agentcore" },
	"io.camunda.connectors.aws.bedrock.codeinterpreter.v1": { alias: "bedrock-code" },
	"io.camunda.connectors.aws.bedrock.knowledgebase.v1": { alias: "bedrock-kb" },
	"io.camunda.connectors.aws.bedrock.agentcore.memory.longterm.v1": {
		alias: "bedrock-memory",
		operations: ["operation.operationDiscriminator"],
	},
	"io.camunda.connectors.BluePrism.v1": { alias: "blueprism", operations: ["operationType"] },
	"io.camunda.connectors.box": { alias: "box", operations: ["operation.type"] },
	"io.camunda.connectors.CamundaOrchestrationCluster.v1": {
		alias: "camunda-api",
		operations: ["input.internal_endpoint"],
	},
	"io.camunda.connectors.AWSCOMPREHEND.v1": { alias: "comprehend", operations: ["input.type"] },
	"io.camunda.connectors.csv": { alias: "csv", operations: ["operation"] },
	"io.camunda.connectors.databricks.rest.v1": {
		alias: "databricks",
		operations: [
			"service",
			"sqlOperation",
			"warehouseOperation",
			"jobsOperation",
			"servingOperation",
			"vectorSearchOperation",
		],
	},
	"io.camunda.connectors.AWSDynamoDB.v1": {
		alias: "dynamodb",
		operations: ["input.operationGroup", "input.tableOperation", "input.itemOperation"],
	},
	"io.camunda.connectors.EasyPost.v1": { alias: "easypost", operations: ["operationType"] },
	"io.camunda.connectors.email.v1": {
		alias: "email",
		operations: [
			"protocol",
			"data.imapActionDiscriminator",
			"data.pop3ActionDiscriminator",
			"data.smtpActionDiscriminator",
		],
	},
	"io.camunda.connectors.inbound.EmailBoundary.v1": { alias: "email-boundary" },
	"io.camunda.connectors.inbound.EmailIntermediate.v1": { alias: "email-catch" },
	"io.camunda.connectors.inbound.EmailMessageStart.v1": { alias: "email-message-start" },
	"io.camunda.connectors.inbound.EmailReceive.v1": { alias: "email-receive" },
	"io.camunda.connectors.AWSEventBridge.v1": { alias: "eventbridge" },
	"io.camunda.connectors.AWSEventBridge.boundary.v1": { alias: "eventbridge-boundary" },
	"io.camunda.connectors.AWSEventBridge.intermediate.v1": { alias: "eventbridge-catch" },
	"io.camunda.connectors.AWSEventBridge.MessageStart.v1": { alias: "eventbridge-message-start" },
	"io.camunda.connectors.AWSEventBridge.receive.v1": { alias: "eventbridge-receive" },
	"io.camunda.connectors.AWSEventBridge.startEvent.v1": { alias: "eventbridge-start" },
	"io.camunda.connectors.google.gcp.v1": { alias: "gcs", operations: ["operationDiscriminator"] },
	"io.camunda.connectors.GoogleGemini.v1": { alias: "gemini" },
	"io.camunda.connectors.GitHub.v1": {
		alias: "github",
		operations: [
			"operationGroup",
			"issueOperationType",
			"releaseOperationType",
			"branchOperationType",
			"reposOperationType",
			"listAlertsOperationType",
			"eventOperationType",
			"referenceOperationType",
			"pullRequestOperationType",
			"listCollaboratorsOperationType",
			"labelOperationType",
		],
	},
	"io.camunda.connectors.webhook.GithubWebhookConnectorBoundary.v1": {
		alias: "github-webhook-boundary",
	},
	"io.camunda.connectors.webhook.GithubWebhookConnectorIntermediate.v1": {
		alias: "github-webhook-catch",
	},
	"io.camunda.connectors.webhook.GithubWebhookConnectorMessageStart.v1": {
		alias: "github-webhook-message-start",
	},
	"io.camunda.connectors.webhook.GithubWebhookConnectorReceive.v1": {
		alias: "github-webhook-receive",
	},
	"io.camunda.connectors.webhook.GithubWebhookConnector.v1": { alias: "github-webhook-start" },
	"io.camunda.connectors.GitLab.v1": {
		alias: "gitlab",
		operations: [
			"operationGroup",
			"issueOperation",
			"releaseOperation",
			"branchOperation",
			"reposOperation",
			"mergeOperation",
		],
	},
	"io.camunda.connectors.GoogleDrive.v1": { alias: "google-drive", operations: ["resource.type"] },
	"io.camunda.connectors.GoogleMapsPlatform.v1": {
		alias: "google-maps",
		operations: ["operationType"],
	},
	"io.camunda.connectors.GoogleSheets.v1": {
		alias: "google-sheets",
		operations: ["operation.type"],
	},
	"io.camunda.connectors.GraphQL.v1": { alias: "graphql" },
	"io.camunda.connectors.HttpJson.v2": { alias: "http" },
	"io.camunda.connectors.http.Polling.Boundary": { alias: "http-polling-boundary" },
	"io.camunda.connectors.http.Polling": { alias: "http-polling-catch" },
	"io.camunda.connectors.HubSpot.v1": {
		alias: "hubspot",
		operations: ["resourceType", "operationId"],
	},
	"io.camunda.connectors.HuggingFace.v1": { alias: "huggingface" },
	"io.camunda.connectors.KAFKA.v1": { alias: "kafka" },
	"io.camunda.connectors.inbound.KafkaBoundary.v1": { alias: "kafka-boundary" },
	"io.camunda.connectors.inbound.KafkaIntermediate.v1": { alias: "kafka-catch" },
	"io.camunda.connectors.inbound.KafkaMessageStart.v1": { alias: "kafka-message-start" },
	"io.camunda.connectors.inbound.KafkaReceive.v1": { alias: "kafka-receive" },
	"io.camunda.connectors.AWSLAMBDA.v2": { alias: "lambda" },
	"io.camunda.connectors.agenticai.mcp.client.v0": { alias: "mcp" },
	"io.camunda.mcp.start-message": { alias: "mcp-message-start" },
	"io.camunda.connectors.agenticai.mcp.remoteclient.v0": { alias: "mcp-remote" },
	"io.camunda.connectors.inbound.MSFT.O365.EmailBoundary.v1": { alias: "o365-email-boundary" },
	"io.camunda.connectors.inbound.MSFT.O365.EmailIntermediate.v1": { alias: "o365-email-catch" },
	"io.camunda.connectors.inbound.MSFT.O365.EmailMessageStart.v1": {
		alias: "o365-email-message-start",
	},
	"io.camunda.connectors.MSFT.O365.Mail.v1": { alias: "o365-mail", operations: ["operationId"] },
	"io.camunda.connectors.OpenAI.v1": { alias: "openai", operations: ["operation"] },
	"io.camunda.connectors.CamundaOperate.v1": {
		alias: "operate",
		operations: ["input.internal_endpoint"],
	},
	"io.camunda.connectors.PowerAutomate.v1": {
		alias: "power-automate",
		operations: ["operationType"],
	},
	"io.camunda.connectors.RabbitMQ.v1": { alias: "rabbitmq" },
	"io.camunda.connectors.inbound.RabbitMQ.Boundary.v1": { alias: "rabbitmq-boundary" },
	"io.camunda.connectors.inbound.RabbitMQ.Intermediate.v1": { alias: "rabbitmq-catch" },
	"io.camunda.connectors.inbound.RabbitMQ.MessageStart.v1": { alias: "rabbitmq-message-start" },
	"io.camunda.connectors.inbound.RabbitMQ.Receive.v1": { alias: "rabbitmq-receive" },
	"io.camunda.connectors.inbound.RabbitMQ.StartEvent.v1": { alias: "rabbitmq-start" },
	"camunda.connectors.rpa": { alias: "rpa" },
	"io.camunda.connectors.aws.s3.v1": { alias: "s3", operations: ["actionDiscriminator"] },
	"io.camunda.connectors.AWSSAGEMAKER.v1": {
		alias: "sagemaker",
		operations: ["input.invocationType"],
	},
	"io.camunda.connectors.Salesforce.v1": {
		alias: "salesforce",
		operations: ["salesforceOperationType"],
	},
	"io.camunda.connectors.message.sendtask.v1": { alias: "send-message" },
	"io.camunda.connectors.message.end.v1": { alias: "send-message-end" },
	"io.camunda.connectors.message.intermediate.v1": { alias: "send-message-throw" },
	"io.camunda.connectors.SendGrid.v2": {
		alias: "sendgrid",
		operations: ["unMappedFieldNotUseInModel.mailType"],
	},
	"io.camunda.connectors.ServiceNow.v1": { alias: "servicenow", operations: ["operationGroup"] },
	"io.camunda.connectors.ServiceNowFlow.v1": { alias: "servicenow-flow" },
	"io.camunda.connectors.ServiceNowIncident.v1": {
		alias: "servicenow-incident",
		operations: ["operationGroup"],
	},
	"io.camunda.connectors.Slack.v1": { alias: "slack", operations: ["method"] },
	"io.camunda.connectors.inbound.Slack.BoundaryEvent.v1": { alias: "slack-boundary" },
	"io.camunda.connectors.inbound.Slack.IntermediateCatchEvent.v1": { alias: "slack-catch" },
	"io.camunda.connectors.inbound.Slack.MessageStartEvent.v1": { alias: "slack-message-start" },
	"io.camunda.connectors.inbound.Slack.ReceiveTask.v1": { alias: "slack-receive" },
	"io.camunda.connectors.inbound.Slack.StartEvent.v1": { alias: "slack-start" },
	"io.camunda.connectors.AWSSNS.v1": { alias: "sns" },
	"io.camunda.connectors.inbound.AWSSNS.Boundary.v1": { alias: "sns-boundary" },
	"io.camunda.connectors.inbound.AWSSNS.IntermediateCatchEvent.v1": { alias: "sns-catch" },
	"io.camunda.connectors.inbound.AWSSNS.MessageStartEvent.v1": { alias: "sns-message-start" },
	"io.camunda.connectors.inbound.AWSSNS.Receive.v1": { alias: "sns-receive" },
	"io.camunda.connectors.inbound.AWSSNS.StartEvent.v1": { alias: "sns-start" },
	"io.camunda:soap": { alias: "soap" },
	"io.camunda.connectors.Jdbc.v1": { alias: "sql" },
	"io.camunda.connectors.AWSSQS.v1": { alias: "sqs" },
	"io.camunda.connectors.AWSSQS.boundary.v1": { alias: "sqs-boundary" },
	"io.camunda.connectors.AWSSQS.intermediate.v1": { alias: "sqs-catch" },
	"io.camunda.connectors.AWSSQS.startmessage.v1": { alias: "sqs-message-start" },
	"io.camunda.connectors.AWSSQS.receive.v1": { alias: "sqs-receive" },
	"io.camunda.connectors.AWSSQS.StartEvent.v1": { alias: "sqs-start" },
	"io.camunda.connectors.MSTeams.v1": {
		alias: "teams",
		operations: ["data.type", "data.chatMethod", "data.channelMethod"],
	},
	"io.camunda.connectors.AWSTEXTRACT.v1": { alias: "textract" },
	"io.camunda.connectors.Twilio.v1": { alias: "twilio", operations: ["operationType"] },
	"io.camunda.connectors.Twilio.Webhook.Boundary.v1": { alias: "twilio-boundary" },
	"io.camunda.connectors.Twilio.Webhook.Intermediate.v1": { alias: "twilio-catch" },
	"io.camunda.connectors.TwilioWebhookMessageStart.v1": { alias: "twilio-message-start" },
	"io.camunda.connectors.Twilio.Webhook.Receive.v1": { alias: "twilio-receive" },
	"io.camunda.connectors.TwilioWebhook.v1": { alias: "twilio-start" },
	"io.camunda.connectors.UIPath.v1": { alias: "uipath", operations: ["operationType"] },
	"io.camunda.connectors.EmbeddingsVectorDB.v1": {
		alias: "vector-db",
		operations: ["vectorDatabaseConnectorOperation.operationType"],
	},
	"io.camunda.connectors.webhook.WebhookConnectorBoundary.v1": { alias: "webhook-boundary" },
	"io.camunda.connectors.webhook.WebhookConnectorIntermediate.v1": { alias: "webhook-catch" },
	"io.camunda.connectors.webhook.WebhookConnectorStartMessage.v1": {
		alias: "webhook-message-start",
	},
	"io.camunda.connectors.webhook.WebhookConnectorReceive.v1": { alias: "webhook-receive" },
	"io.camunda.connectors.webhook.WebhookConnector.v1": { alias: "webhook-start" },
	"io.camunda.connectors.WhatsApp.v1": { alias: "whatsapp", operations: ["messageType"] },
}
