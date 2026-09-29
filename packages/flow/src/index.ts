/**
 * @bpmnkit/flow — code-first durable flows.
 *
 * One TypeScript definition yields the BPMN process, its job types, its message
 * correlation and the worker for its handler steps, so the model and the code
 * cannot drift apart.
 */
export {
	AGENT_PROMPT_HEADER,
	AGENT_RESULT_HEADER,
	DEFAULT_AGENT_RESULT,
	agentJobType,
	agentJobTypes,
	promptVariables,
	renderPrompt,
} from "./agent.js"
export { Flow, FlowBuilder, defineFlow } from "./flow.js"
export type {
	AgentOptions,
	ApproveOptions,
	FlowStep,
	RunOptions,
	StepContext,
	StepHandler,
	WaitOptions,
} from "./flow.js"
export type { FlowWorker, FlowWorkerOptions } from "./worker.js"
