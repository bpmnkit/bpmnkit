/**
 * Which BPMN constructs and Zeebe properties each Camunda 8 version supports —
 * the data behind `analyzeCamundaCompat`.
 *
 * Taken from `bpmnlint-plugin-camunda-compat` 2.61.0 (MIT, © Camunda Services
 * GmbH), the rule set Camunda Modeler lints with through `@camunda/linting`
 * 3.57.0; the FEEL built-in table is from `@camunda/feel-builtins` 1.4.1
 * (MIT, © Camunda Services GmbH).
 *
 * The tables live in `spec/compat-rules.json` (shared with the Rust crates) and
 * are generated into `../generated/camunda-compat-data.ts` by `pnpm spec:gen`.
 * This module re-exports them and rebuilds `TIMER_SUPPORT`'s functions from the
 * data's 2x2 table. When the plugin moves, update the JSON, including
 * `source`; nothing else in BPMN Kit hard-codes a Camunda version for these checks.
 *
 * @packageDocumentation
 */

import {
	type CamundaCompatVersion,
	TIMER_SUPPORT_TABLE,
	type TimerProperty,
} from "../generated/camunda-compat-data.js"

export {
	CAMUNDA_COMPAT_PLUGIN_VERSION,
	CAMUNDA_COMPAT_RULES,
	CAMUNDA_COMPAT_VERSIONS,
	CRON_TIMER_SINCE,
	ELEMENT_SUPPORT,
	FEATURE_SINCE,
	FEEL_BUILTIN_SINCE,
	IMPLEMENTATION_SUPPORT,
	INBOUND_CONNECTOR_PROPERTY_SINCE,
} from "../generated/camunda-compat-data.js"
export type {
	CamundaCompatCoverage,
	CamundaCompatRule,
	CamundaCompatVersion,
	ImplementationKind,
	TimerProperty,
} from "../generated/camunda-compat-data.js"

/**
 * First version each timer property is allowed in, per event type. `null`
 * means never; the functions receive whether the event interrupts and whether
 * it starts an event sub-process.
 */
export const TIMER_SUPPORT: Readonly<
	Record<
		string,
		Readonly<
			Record<
				TimerProperty,
				(interrupting: boolean, inEventSubProcess: boolean) => CamundaCompatVersion | null
			>
		>
	>
> = Object.fromEntries(
	Object.entries(TIMER_SUPPORT_TABLE).map(([eventType, props]) => [
		eventType,
		Object.fromEntries(
			Object.entries(props).map(([property, cell]) => [
				property,
				(interrupting: boolean, inEventSubProcess: boolean) =>
					cell[interrupting ? "interrupting" : "nonInterrupting"][
						inEventSubProcess ? "inEventSubProcess" : "elsewhere"
					],
			]),
		),
	]),
) as never
