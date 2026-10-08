/**
 * The properties panel of the editor: the selected element's configuration —
 * task types, connector inputs, conditions, timers.
 *
 * Its own chunk, fetched once the editor is already open: the connector
 * templates it renders forms from are megabytes, and nobody should wait for
 * them to start moving shapes.
 */
import type { CanvasPlugin } from "@bpmnkit/canvas"
import type { BpmnDefinitions } from "@bpmnkit/core"
import type { Translate } from "@bpmnkit/editor"
import { createConfigPanelPlugin } from "@bpmnkit/plugins/config-panel"
import { createConfigPanelBpmnPlugin } from "@bpmnkit/plugins/config-panel-bpmn"

export interface PropertiesOptions {
	getDefinitions(): BpmnDefinitions | null
	/** Applies a change made in the panel as an ordinary edit, so it reaches the room as an op. */
	applyChange(fn: (defs: BpmnDefinitions) => BpmnDefinitions): void
	/** Holds the panel; shown while one element is selected. */
	container: HTMLElement
	translate?: Translate
}

export function createPropertiesPlugins(options: PropertiesOptions): CanvasPlugin[] {
	const { container } = options
	const panel = createConfigPanelPlugin({
		getDefinitions: options.getDefinitions,
		applyChange: options.applyChange,
		container,
		translate: options.translate,
		onPanelShow: () => {
			container.hidden = false
		},
		onPanelHide: () => {
			container.hidden = true
		},
	})
	return [
		panel,
		createConfigPanelBpmnPlugin(panel, {
			applyChange: options.applyChange,
			translate: options.translate,
		}),
	]
}
