import { BPMNKIT_CONNECTOR_TEMPLATES, type ElementTemplate } from "@bpmnkit/connectors"
import type { APIRoute } from "astro"

/**
 * The templates BPMN Kit maintains, as files Camunda Modeler can load.
 * Camunda's own templates are left to Camunda's marketplace.
 */
export function getStaticPaths() {
	return BPMNKIT_CONNECTOR_TEMPLATES.map((template) => ({
		params: { id: template.id },
		props: { template },
	}))
}

export const GET: APIRoute = ({ props }) => {
	const { template } = props as { template: ElementTemplate }
	const document = {
		$schema: "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
		...template,
	}
	return new Response(`${JSON.stringify(document, null, 2)}\n`, {
		headers: { "Content-Type": "application/json" },
	})
}
