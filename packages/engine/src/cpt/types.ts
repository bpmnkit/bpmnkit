/** Selector for a job; at least one field is required (checked by `parseCptFile`). */
export interface CptJobSelector {
	jobType?: string
	elementId?: string
	processDefinitionId?: string
}

/** Selector for a user task; at least one field is required. */
export interface CptUserTaskSelector {
	elementId?: string
	processDefinitionId?: string
}

export type CptInstruction =
	| {
			type: "CREATE_PROCESS_INSTANCE"
			processDefinitionSelector: { processDefinitionId: string }
			variables: Record<string, unknown>
	  }
	| { type: "COMPLETE_JOB"; jobSelector: CptJobSelector; variables: Record<string, unknown> }
	| {
			type: "COMPLETE_JOB_AD_HOC_SUB_PROCESS"
			jobSelector: CptJobSelector
			variables: Record<string, unknown>
			activateElements: { elementId: string; variables?: Record<string, unknown> }[]
			completionConditionFulfilled: boolean
			cancelRemainingInstances: boolean
	  }
	| {
			type: "COMPLETE_USER_TASK"
			userTaskSelector: CptUserTaskSelector
			variables: Record<string, unknown>
	  }
	| {
			type: "ASSERT_ELEMENT_INSTANCES"
			processInstanceSelector: { processDefinitionId: string }
			elementSelectors: { elementId: string }[]
			state: "IS_ACTIVE" | "IS_COMPLETED" | "IS_COMPLETED_IN_ORDER"
	  }
	| {
			type: "ASSERT_PROCESS_INSTANCE"
			processInstanceSelector: { processDefinitionId: string }
			state: "IS_ACTIVE" | "IS_COMPLETED"
	  }

export interface CptTestCase {
	name: string
	description?: string
	instructions: CptInstruction[]
}

export interface CptFile {
	$schema: string
	testCases: CptTestCase[]
}

export interface CptFailure {
	index: number
	type: string
	message: string
}

export interface CptCaseResult {
	name: string
	passed: boolean
	failure?: CptFailure
}

export interface CptReport {
	cases: CptCaseResult[]
}
