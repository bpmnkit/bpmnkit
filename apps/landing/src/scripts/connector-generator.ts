/**
 * The connector generator, run in the page.
 *
 * `@bpmnkit/connector-gen` already turns an OpenAPI or Swagger spec into Camunda
 * REST connector element templates, but until now it was reachable only from
 * the CLI and the npm package. This puts the same generator behind a drop zone:
 * the spec is read and converted in the browser and never leaves the visitor's
 * machine.
 */

import {
	buildTemplate,
	detectDefaultAuth,
	getOperations,
	parseOpenApi,
} from "@bpmnkit/connector-gen/browser"
import type { AuthHint, ConnectorTemplate } from "@bpmnkit/connector-gen/browser"

export interface GeneratorSettings {
	readonly idPrefix: string
	readonly baseUrl: string
	readonly filter: string
	readonly expandBody: boolean
	readonly auth: AuthHint | "auto"
}

export interface GeneratedConnector {
	readonly method: string
	readonly path: string
	readonly template: ConnectorTemplate
}

export interface GeneratorResult {
	readonly title: string
	readonly version: string
	readonly auth: AuthHint
	readonly connectors: GeneratedConnector[]
}

export const AUTH_LABELS: Record<AuthHint, string> = {
	noAuth: "No auth",
	apiKey: "API key",
	basic: "Basic auth",
	bearer: "Bearer token",
	"oauth-client-credentials-flow": "OAuth 2.0 client credentials",
}

/** Generate templates from spec text; throws with a message fit to show the visitor. */
export function generateConnectors(specText: string, settings: GeneratorSettings): GeneratorResult {
	const idPrefix = settings.idPrefix.trim()
	if (!idPrefix) throw new Error("Enter an ID prefix, e.g. com.mycompany.")
	const filter = settings.filter.trim()
	if (filter) {
		try {
			new RegExp(filter)
		} catch {
			throw new Error(`The operation filter "${filter}" is not a valid regular expression.`)
		}
	}
	const doc = parseOpenApi(specText)
	if (!doc || typeof doc !== "object") {
		throw new Error("That file does not contain an OpenAPI or Swagger document.")
	}
	const auth = settings.auth === "auto" ? detectDefaultAuth(doc) : settings.auth
	const options = {
		idPrefix,
		baseUrl: settings.baseUrl.trim() || undefined,
		expandBody: settings.expandBody,
		defaultAuthType: auth,
	}
	const connectors = getOperations(doc, filter || undefined).map((op) => ({
		method: op.method.toUpperCase(),
		path: op.path,
		template: buildTemplate(op, options),
	}))
	return {
		title: doc.info?.title ?? "Untitled API",
		version: doc.info?.version ?? "",
		auth,
		connectors,
	}
}

/**
 * The JSON to save. Camunda Modeler and the bpmnkit editor both accept a file
 * holding either one template object or an array of them.
 */
export function serializeTemplates(templates: readonly ConnectorTemplate[]): string {
	return `${JSON.stringify(templates.length === 1 ? templates[0] : templates, null, 2)}\n`
}

/** `Pet Store API` → `pet-store-api-connectors.json`. */
export function templatesFileName(title: string): string {
	const slug = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
	return `${slug || "api"}-connectors.json`
}

// ─── DOM ──────────────────────────────────────────────────────────────────────

export interface ExampleSpec {
	readonly fileName: string
	readonly spec: string
}

/** One-click specs so a visitor can see the generator work without a file of their own. */
export const EXAMPLES: Record<string, ExampleSpec> = {
	petstore: {
		fileName: "pet-store.openapi.yaml",
		spec: `openapi: "3.0.3"
info:
  title: Pet Store API
  version: "1.0.0"
servers:
  - url: https://petstore.example.com/v1
components:
  securitySchemes:
    apiKey:
      type: apiKey
      in: header
      name: X-API-Key
paths:
  /pets:
    get:
      operationId: listPets
      summary: List all pets
      parameters:
        - name: limit
          in: query
          schema: { type: integer }
      responses:
        "200":
          description: A list of pets
    post:
      operationId: createPet
      summary: Create a pet
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name]
              properties:
                name: { type: string }
                tag: { type: string }
      responses:
        "201":
          description: Created
  /pets/{petId}:
    get:
      operationId: showPetById
      summary: Info for a specific pet
      parameters:
        - name: petId
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: The pet
    delete:
      operationId: deletePet
      summary: Delete a pet
      parameters:
        - name: petId
          in: path
          required: true
          schema: { type: string }
      responses:
        "204":
          description: Deleted
`,
	},
	inventory: {
		fileName: "inventory.swagger.yaml",
		spec: `swagger: "2.0"
info:
  title: Inventory API
  version: "2.1.0"
host: inventory.example.com
basePath: /api
schemes: [https]
securityDefinitions:
  basicAuth:
    type: basic
paths:
  /items:
    get:
      operationId: searchItems
      summary: Search items
      parameters:
        - name: q
          in: query
          type: string
        - name: inStock
          in: query
          type: boolean
      responses:
        "200":
          description: Matching items
    post:
      operationId: addItem
      summary: Add an item
      parameters:
        - name: item
          in: body
          required: true
          schema:
            $ref: "#/definitions/Item"
      responses:
        "201":
          description: Created
  /items/{sku}/stock:
    put:
      operationId: updateStock
      summary: Update stock level
      parameters:
        - name: sku
          in: path
          required: true
          type: string
        - name: level
          in: body
          required: true
          schema:
            type: object
            properties:
              quantity: { type: integer }
      responses:
        "200":
          description: Updated
definitions:
  Item:
    type: object
    required: [sku, name]
    properties:
      sku: { type: string }
      name: { type: string }
      price: { type: number }
`,
	},
}

function $<T extends HTMLElement>(root: HTMLElement, selector: string): T {
	const el = root.querySelector<T>(selector)
	if (!el) throw new Error(`connector generator: missing ${selector}`)
	return el
}

function download(text: string, fileName: string, type = "application/json"): void {
	const url = URL.createObjectURL(new Blob([text], { type }))
	const a = document.createElement("a")
	a.href = url
	a.download = fileName
	a.click()
	URL.revokeObjectURL(url)
}

export function mountConnectorGenerator(root: HTMLElement): void {
	const dropZone = $<HTMLElement>(root, "[data-cg-drop]")
	const fileInput = $<HTMLInputElement>(root, "[data-cg-file]")
	const exampleBtns = root.querySelectorAll<HTMLButtonElement>("[data-cg-example]")
	const exampleDownload = $<HTMLButtonElement>(root, "[data-cg-example-download]")
	const sourceLabel = $<HTMLElement>(root, "[data-cg-source]")
	const idPrefix = $<HTMLInputElement>(root, "[data-cg-prefix]")
	const baseUrl = $<HTMLInputElement>(root, "[data-cg-base-url]")
	const filter = $<HTMLInputElement>(root, "[data-cg-filter]")
	const expandBody = $<HTMLInputElement>(root, "[data-cg-expand]")
	const auth = $<HTMLSelectElement>(root, "[data-cg-auth]")
	const error = $<HTMLElement>(root, "[data-cg-error]")
	const results = $<HTMLElement>(root, "[data-cg-results]")
	const summary = $<HTMLElement>(root, "[data-cg-summary]")
	const selectAll = $<HTMLInputElement>(root, "[data-cg-select-all]")
	const list = $<HTMLElement>(root, "[data-cg-list]")
	const downloadBtn = $<HTMLButtonElement>(root, "[data-cg-download]")
	const copyBtn = $<HTMLButtonElement>(root, "[data-cg-copy]")
	const status = $<HTMLElement>(root, "[data-cg-status]")

	let specText: string | null = null
	let example: ExampleSpec | null = null
	let result: GeneratorResult | null = null
	const selected = new Set<number>()

	function selectedTemplates(): ConnectorTemplate[] {
		return result ? result.connectors.filter((_, i) => selected.has(i)).map((c) => c.template) : []
	}

	function refreshSelection(): void {
		const total = result?.connectors.length ?? 0
		selectAll.checked = total > 0 && selected.size === total
		selectAll.indeterminate = selected.size > 0 && selected.size < total
		downloadBtn.disabled = selected.size === 0
		copyBtn.disabled = selected.size === 0
		downloadBtn.textContent = `Download ${selected.size} template${selected.size === 1 ? "" : "s"}`
	}

	function renderList(connectors: readonly GeneratedConnector[]): void {
		list.replaceChildren(
			...connectors.map(({ method, path, template }, index) => {
				const row = document.createElement("details")
				row.className = "cg-row"
				const head = document.createElement("summary")
				const box = document.createElement("input")
				box.type = "checkbox"
				box.checked = selected.has(index)
				box.setAttribute("aria-label", `Include ${template.name}`)
				box.addEventListener("click", (e) => e.stopPropagation())
				box.addEventListener("change", () => {
					if (box.checked) selected.add(index)
					else selected.delete(index)
					refreshSelection()
				})
				const methodEl = document.createElement("span")
				methodEl.className = "cg-method"
				methodEl.textContent = method
				const name = document.createElement("span")
				name.className = "cg-name"
				name.textContent = template.name
				const pathEl = document.createElement("span")
				pathEl.className = "cg-path"
				pathEl.textContent = path
				head.append(box, methodEl, name, pathEl)
				row.append(head)
				// Rendered on first open: a large spec yields hundreds of templates.
				row.addEventListener("toggle", () => {
					if (!row.open || row.querySelector("pre")) return
					const pre = document.createElement("pre")
					pre.className = "cg-json"
					pre.textContent = serializeTemplates([template])
					row.append(pre)
				})
				return row
			}),
		)
	}

	function run(): void {
		status.textContent = ""
		if (specText === null) return
		try {
			result = generateConnectors(specText, {
				idPrefix: idPrefix.value,
				baseUrl: baseUrl.value,
				filter: filter.value,
				expandBody: expandBody.checked,
				auth: auth.value as GeneratorSettings["auth"],
			})
		} catch (e) {
			result = null
			error.textContent = e instanceof Error ? e.message : String(e)
			results.hidden = true
			return
		}
		error.textContent = ""
		selected.clear()
		result.connectors.forEach((_, i) => selected.add(i))
		const { title, version, connectors } = result
		summary.textContent =
			connectors.length === 0
				? `${title} has no operations${filter.value.trim() ? " matching the filter" : ""}.`
				: `${connectors.length} template${connectors.length === 1 ? "" : "s"} from ${title}${version ? ` v${version}` : ""} · ${AUTH_LABELS[result.auth]}`
		renderList(connectors)
		refreshSelection()
		results.hidden = false
	}

	function load(text: string, source: string, from: ExampleSpec | null = null): void {
		specText = text
		example = from
		sourceLabel.textContent = source
		exampleDownload.hidden = from === null
		run()
	}

	async function loadFile(file: File): Promise<void> {
		try {
			load(await file.text(), file.name)
		} catch (e) {
			error.textContent = `Could not read ${file.name}: ${e instanceof Error ? e.message : String(e)}`
		}
	}

	dropZone.addEventListener("dragover", (e) => {
		e.preventDefault()
		dropZone.classList.add("is-over")
	})
	dropZone.addEventListener("dragleave", () => dropZone.classList.remove("is-over"))
	dropZone.addEventListener("drop", (e) => {
		e.preventDefault()
		dropZone.classList.remove("is-over")
		const file = e.dataTransfer?.files[0]
		if (file) void loadFile(file)
	})
	fileInput.addEventListener("change", () => {
		const file = fileInput.files?.[0]
		if (file) void loadFile(file)
		fileInput.value = ""
	})
	for (const btn of exampleBtns) {
		const spec = EXAMPLES[btn.dataset.cgExample ?? ""]
		if (spec)
			btn.addEventListener("click", () => load(spec.spec, `${spec.fileName} (example)`, spec))
	}
	exampleDownload.addEventListener("click", () => {
		if (example) download(example.spec, example.fileName, "application/yaml")
	})

	let timer: ReturnType<typeof setTimeout> | undefined
	for (const input of [idPrefix, baseUrl, filter]) {
		input.addEventListener("input", () => {
			clearTimeout(timer)
			timer = setTimeout(run, 250)
		})
	}
	expandBody.addEventListener("change", run)
	auth.addEventListener("change", run)

	selectAll.addEventListener("change", () => {
		selected.clear()
		if (selectAll.checked) result?.connectors.forEach((_, i) => selected.add(i))
		for (const box of list.querySelectorAll<HTMLInputElement>("summary input")) {
			box.checked = selectAll.checked
		}
		refreshSelection()
	})

	downloadBtn.addEventListener("click", () => {
		if (!result) return
		download(serializeTemplates(selectedTemplates()), templatesFileName(result.title))
	})
	copyBtn.addEventListener("click", async () => {
		try {
			await navigator.clipboard.writeText(serializeTemplates(selectedTemplates()))
			status.textContent = "Copied to clipboard."
		} catch {
			status.textContent = "Copy failed — use Download instead."
		}
	})
}
