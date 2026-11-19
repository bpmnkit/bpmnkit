import { generateId } from "../types/id-generator.js"
import { compositeKey, stableToken } from "../types/stable-key.js"
import type {
	FormButtonComponent,
	FormCheckboxComponent,
	FormChecklistComponent,
	FormComponent,
	FormConditional,
	FormDatetimeComponent,
	FormDefinition,
	FormDocumentPreviewComponent,
	FormDynamicListComponent,
	FormExporter,
	FormExpressionComponent,
	FormFilepickerComponent,
	FormGroupComponent,
	FormHtmlComponent,
	FormIframeComponent,
	FormImageComponent,
	FormLayoutInput,
	FormNumberComponent,
	FormRadioComponent,
	FormSelectComponent,
	FormSeparatorComponent,
	FormSpacerComponent,
	FormTableComponent,
	FormTaglistComponent,
	FormTextAreaComponent,
	FormTextComponent,
	FormTextFieldComponent,
	FormValidation,
	FormValueOption,
} from "./form-model.js"

/** A layout the builder has filled in: both fields present, the way Camunda writes them. */
interface ResolvedLayout {
	row: string
	columns: number | null
}

/** The id and layout a component ends up with. */
interface ComponentNames {
	id: string
	layout: ResolvedLayout
	conditional?: FormConditional
}

/** The parts of a component's options that naming reads. */
interface NamingOptions {
	id?: string
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/**
 * Mints the id and layout row for the components of one scope — a form, or a
 * group inside it.
 *
 * Every generated component carries a layout because Camunda Modeler and the
 * form-js importer read a missing `layout` as a legacy schema and backfill a
 * row/columns pair on open, showing a spurious diff on a form this builder just
 * produced. Both values are derived from the component's own identity — its
 * field key, or its text for a static block — rather than from its position or
 * from a random draw, so rebuilding an unchanged form is byte-identical and
 * reordering two fields moves nothing but their order. The row lives in its own
 * `"row"` namespace so it never equals the id derived from the same identity.
 *
 * `occurrences` covers the one case identity cannot: two components of a type
 * that are genuinely indistinguishable. Nothing intrinsic separates them, so
 * they are numbered in the order they were added.
 */
class ScopeNames {
	private readonly scope: string
	private readonly occurrences = new Map<string, number>()

	constructor(scope: string) {
		this.scope = scope
	}

	/**
	 * @param type - The component's `type` discriminator.
	 * @param identity - What the component is known by: its field key, or its
	 *   text or label when it has no key.
	 */
	resolve(type: string, identity: string, options?: NamingOptions): ComponentNames {
		const segments = [this.scope, type, identity]
		const key = compositeKey(segments)
		const occurrence = (this.occurrences.get(key) ?? 0) + 1
		this.occurrences.set(key, occurrence)
		if (occurrence > 1) segments.push(`#${occurrence}`)
		return {
			id: options?.id ?? stableToken("Field", segments),
			layout: {
				// `??` is the whole null asymmetry documented on FormLayoutInput: a
				// null row falls through to a generated one, a null columns lands on
				// null and is kept.
				row: options?.layout?.row ?? stableToken("Row", [...segments, "row"]),
				columns: options?.layout?.columns ?? null,
			},
			...(options?.conditional !== undefined ? { conditional: options.conditional } : {}),
		}
	}
}

/**
 * What FormBuilder and GroupBuilder share: the scope's naming and every
 * component method. Keeping them in one place is what stops the two from
 * drifting when a component type is added.
 */
abstract class ComponentContainer {
	/** @internal */
	readonly _components: FormComponent[] = []
	/** @internal Replaced by `FormBuilder.id()`, which moves the naming scope. */
	protected _names: ScopeNames

	protected constructor(scope: string) {
		this._names = new ScopeNames(scope)
	}

	/** Appends a component, adding the layout and conditional the way every method does. */
	private add(component: FormComponent, names: ComponentNames): this {
		component.layout = names.layout
		if (names.conditional !== undefined) component.conditional = names.conditional
		this._components.push(component)
		return this
	}

	/** Builds a nested scope whose generated names hang off the container's id. */
	private nest(names: ComponentNames, builder: (group: GroupBuilder) => void): GroupBuilder {
		const nested = new GroupBuilder(names.id)
		builder(nested)
		return nested
	}

	/** Adds a static text component. */
	text(
		text: string,
		options?: {
			id?: string
			label?: string
			layout?: FormLayoutInput
			conditional?: FormConditional
		},
	): this {
		const names = this._names.resolve("text", text, options)
		const component: FormTextComponent = { type: "text", id: names.id, text }
		if (options?.label !== undefined) component.label = options.label
		return this.add(component, names)
	}

	/** Adds a text field component. */
	textfield(label: string, key: string, options?: TextFieldOptions): this {
		const names = this._names.resolve("textfield", key, options)
		const component: FormTextFieldComponent = { type: "textfield", id: names.id, label, key }
		if (options?.validate !== undefined) component.validate = options.validate
		if (options?.defaultValue !== undefined) component.defaultValue = options.defaultValue
		return this.add(component, names)
	}

	/** Adds a textarea component. */
	textarea(label: string, key: string, options?: TextFieldOptions): this {
		const names = this._names.resolve("textarea", key, options)
		const component: FormTextAreaComponent = { type: "textarea", id: names.id, label, key }
		if (options?.validate !== undefined) component.validate = options.validate
		if (options?.defaultValue !== undefined) component.defaultValue = options.defaultValue
		return this.add(component, names)
	}

	/** Adds a number input component. */
	number(label: string, key: string, options?: NumberOptions): this {
		const names = this._names.resolve("number", key, options)
		const component: FormNumberComponent = { type: "number", id: names.id, label, key }
		if (options?.validate !== undefined) component.validate = options.validate
		if (options?.defaultValue !== undefined) component.defaultValue = options.defaultValue
		return this.add(component, names)
	}

	/** Adds a date and/or time picker component. */
	datetime(key: string, options?: DatetimeOptions): this {
		const names = this._names.resolve("datetime", key, options)
		const component: FormDatetimeComponent = { type: "datetime", id: names.id, key }
		if (options?.subtype !== undefined) component.subtype = options.subtype
		if (options?.dateLabel !== undefined) component.dateLabel = options.dateLabel
		if (options?.timeLabel !== undefined) component.timeLabel = options.timeLabel
		if (options?.validate !== undefined) component.validate = options.validate
		return this.add(component, names)
	}

	/** Adds a select dropdown component. */
	select(label: string, key: string, options?: SelectOptions): this {
		const names = this._names.resolve("select", key, options)
		const component: FormSelectComponent = { type: "select", id: names.id, label, key }
		if (options?.values !== undefined) component.values = options.values
		if (options?.valuesKey !== undefined) component.valuesKey = options.valuesKey
		if (options?.validate !== undefined) component.validate = options.validate
		if (options?.searchable !== undefined) component.searchable = options.searchable
		if (options?.defaultValue !== undefined) component.defaultValue = options.defaultValue
		return this.add(component, names)
	}

	/** Adds a radio button group component. */
	radio(label: string, key: string, values: FormValueOption[], options?: RadioOptions): this {
		const names = this._names.resolve("radio", key, options)
		const component: FormRadioComponent = { type: "radio", id: names.id, label, key, values }
		if (options?.validate !== undefined) component.validate = options.validate
		if (options?.defaultValue !== undefined) component.defaultValue = options.defaultValue
		return this.add(component, names)
	}

	/** Adds a checkbox component. */
	checkbox(label: string, key: string, options?: CheckboxOptions): this {
		const names = this._names.resolve("checkbox", key, options)
		const component: FormCheckboxComponent = { type: "checkbox", id: names.id, label, key }
		if (options?.validate !== undefined) component.validate = options.validate
		if (options?.defaultValue !== undefined) component.defaultValue = options.defaultValue
		return this.add(component, names)
	}

	/** Adds a checklist component. */
	checklist(
		label: string,
		key: string,
		values: FormValueOption[],
		options?: ChecklistOptions,
	): this {
		const names = this._names.resolve("checklist", key, options)
		const component: FormChecklistComponent = {
			type: "checklist",
			id: names.id,
			label,
			key,
			values,
		}
		if (options?.validate !== undefined) component.validate = options.validate
		return this.add(component, names)
	}

	/** Adds a tag list component. */
	taglist(label: string, key: string, options?: TaglistOptions): this {
		const names = this._names.resolve("taglist", key, options)
		const component: FormTaglistComponent = { type: "taglist", id: names.id, label, key }
		if (options?.values !== undefined) component.values = options.values
		if (options?.valuesKey !== undefined) component.valuesKey = options.valuesKey
		if (options?.validate !== undefined) component.validate = options.validate
		return this.add(component, names)
	}

	/** Adds a button component. */
	button(label: string, options?: ButtonOptions): this {
		const names = this._names.resolve("button", label, options)
		const component: FormButtonComponent = { type: "button", id: names.id, label }
		if (options?.action !== undefined) component.action = options.action
		return this.add(component, names)
	}

	/** Adds a group component with nested children built via a callback. */
	group(label: string, builder: (group: GroupBuilder) => void, options?: GroupOptions): this {
		const names = this._names.resolve("group", label, options)
		const nested = this.nest(names, builder)
		const component: FormGroupComponent = {
			type: "group",
			id: nested._id,
			label,
			components: nested._components,
		}
		if (options?.showOutline !== undefined) component.showOutline = options.showOutline
		return this.add(component, names)
	}

	/** Adds a repeating list whose item components are built via a callback. */
	dynamiclist(
		label: string,
		builder: (group: GroupBuilder) => void,
		options?: DynamicListOptions,
	): this {
		const names = this._names.resolve("dynamiclist", label, options)
		const nested = this.nest(names, builder)
		const component: FormDynamicListComponent = {
			type: "dynamiclist",
			id: nested._id,
			label,
			components: nested._components,
		}
		if (options?.path !== undefined) component.path = options.path
		if (options?.isRepeating !== undefined) component.isRepeating = options.isRepeating
		if (options?.allowAddRemove !== undefined) component.allowAddRemove = options.allowAddRemove
		if (options?.defaultRepetitions !== undefined) {
			component.defaultRepetitions = options.defaultRepetitions
		}
		if (options?.showOutline !== undefined) component.showOutline = options.showOutline
		return this.add(component, names)
	}

	/** Adds an embedded iframe component. */
	iframe(url: string, options?: IframeOptions): this {
		const names = this._names.resolve("iframe", url, options)
		const component: FormIframeComponent = { type: "iframe", id: names.id, url }
		if (options?.label !== undefined) component.label = options.label
		if (options?.height !== undefined) component.height = options.height
		if (options?.security !== undefined) component.security = options.security
		return this.add(component, names)
	}

	/** Adds an image component; `source` is a URL or FEEL expression. */
	image(source: string, options?: ImageOptions): this {
		const names = this._names.resolve("image", source, options)
		const component: FormImageComponent = { type: "image", id: names.id, source }
		if (options?.alt !== undefined) component.alt = options.alt
		return this.add(component, names)
	}

	/** Adds a read-only data table component. */
	table(label: string, options?: TableOptions): this {
		const names = this._names.resolve("table", label, options)
		const component: FormTableComponent = { type: "table", id: names.id, label }
		if (options?.dataSource !== undefined) component.dataSource = options.dataSource
		if (options?.rowCount !== undefined) component.rowCount = options.rowCount
		if (options?.columns !== undefined) component.columns = options.columns
		return this.add(component, names)
	}

	/** Adds a raw HTML content component. */
	html(content: string, options?: HtmlOptions): this {
		const names = this._names.resolve("html", content, options)
		const component: FormHtmlComponent = { type: "html", id: names.id, content }
		return this.add(component, names)
	}

	/** Adds a separator line. */
	separator(options?: SeparatorOptions): this {
		// No identity: occurrence numbering tells repeated separators apart.
		const names = this._names.resolve("separator", "", options)
		const component: FormSeparatorComponent = { type: "separator", id: names.id }
		return this.add(component, names)
	}

	/** Adds a blank spacer. */
	spacer(options?: SpacerOptions): this {
		const names = this._names.resolve("spacer", "", options)
		const component: FormSpacerComponent = { type: "spacer", id: names.id }
		if (options?.height !== undefined) component.height = options.height
		return this.add(component, names)
	}

	/** Adds a FEEL expression component that writes its result to `key`. */
	expression(key: string, options?: ExpressionOptions): this {
		const names = this._names.resolve("expression", key, options)
		const component: FormExpressionComponent = { type: "expression", id: names.id, key }
		if (options?.expression !== undefined) component.expression = options.expression
		if (options?.computeOn !== undefined) component.computeOn = options.computeOn
		return this.add(component, names)
	}

	/** Adds a file picker component. */
	filepicker(label: string, key: string, options?: FilepickerOptions): this {
		const names = this._names.resolve("filepicker", key, options)
		const component: FormFilepickerComponent = { type: "filepicker", id: names.id, label, key }
		if (options?.multiple !== undefined) component.multiple = options.multiple
		return this.add(component, names)
	}

	/** Adds a document preview component. */
	documentPreview(label: string, options?: DocumentPreviewOptions): this {
		const names = this._names.resolve("documentPreview", label, options)
		const component: FormDocumentPreviewComponent = {
			type: "documentPreview",
			id: names.id,
			label,
		}
		return this.add(component, names)
	}
}

/** Builder for constructing Camunda Forms programmatically. */
export class FormBuilder extends ComponentContainer {
	private _id: string
	private _type = "default"
	private _executionPlatform = "Camunda Cloud"
	private _executionPlatformVersion = "8.10.0"
	private _exporter?: FormExporter
	private _schemaVersion?: number
	private _generated?: boolean

	constructor(id?: string) {
		const formId = id ?? generateId("Form")
		super(formId)
		this._id = formId
	}

	/**
	 * Sets the form ID.
	 *
	 * Set it before adding components. The form id is what scopes their generated
	 * ids and rows — so that one field key means different ids in two different
	 * forms — and components added earlier keep the names they were given under
	 * the previous id. Output stays deterministic either way; it just is not the
	 * same output as passing the id to the constructor.
	 */
	id(id: string): this {
		this._id = id
		this._names = new ScopeNames(id)
		return this
	}

	/** Sets the execution platform. */
	executionPlatform(platform: string): this {
		this._executionPlatform = platform
		return this
	}

	/** Sets the execution platform version. */
	executionPlatformVersion(version: string): this {
		this._executionPlatformVersion = version
		return this
	}

	/** Sets the exporter metadata. */
	exporter(name: string, version: string): this {
		this._exporter = { name, version }
		return this
	}

	/** Sets the schema version. */
	schemaVersion(version: number): this {
		this._schemaVersion = version
		return this
	}

	/** Marks this form as generated. */
	generated(value: boolean): this {
		this._generated = value
		return this
	}

	/** Builds the final FormDefinition. */
	build(): FormDefinition {
		const definition: FormDefinition = {
			id: this._id,
			type: this._type,
			components: this._components,
		}
		if (this._executionPlatform !== undefined) {
			definition.executionPlatform = this._executionPlatform
		}
		if (this._executionPlatformVersion !== undefined) {
			definition.executionPlatformVersion = this._executionPlatformVersion
		}
		if (this._exporter !== undefined) definition.exporter = this._exporter
		if (this._schemaVersion !== undefined) definition.schemaVersion = this._schemaVersion
		if (this._generated !== undefined) definition.generated = this._generated
		return definition
	}
}

/** Sub-builder for group and dynamiclist components. Supports the same component methods as FormBuilder. */
export class GroupBuilder extends ComponentContainer {
	/** @internal */
	readonly _id: string

	/**
	 * @param id - The group component's id, and the scope its children's generated
	 *   ids and rows hang off. `FormBuilder.group()` passes the id it resolved for
	 *   the group, which is itself derived from the form id, so a nested tree is
	 *   deterministic all the way down. A group built standalone without an id
	 *   gets a random one, and its children inherit that instability.
	 */
	constructor(id?: string) {
		const groupId = id ?? generateId("Field")
		super(groupId)
		this._id = groupId
	}
}

/** Options for textfield/textarea components. */
export interface TextFieldOptions {
	id?: string
	validate?: FormValidation
	defaultValue?: string
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for select components. */
export interface SelectOptions {
	id?: string
	values?: FormValueOption[]
	valuesKey?: string
	validate?: FormValidation
	searchable?: boolean
	defaultValue?: string
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for radio components. */
export interface RadioOptions {
	id?: string
	validate?: FormValidation
	defaultValue?: string
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for checkbox components. */
export interface CheckboxOptions {
	id?: string
	validate?: FormValidation
	defaultValue?: boolean
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for checklist components. */
export interface ChecklistOptions {
	id?: string
	validate?: FormValidation
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for group components. */
export interface GroupOptions {
	id?: string
	showOutline?: boolean
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for number components. */
export interface NumberOptions {
	id?: string
	validate?: FormValidation
	defaultValue?: number
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for datetime components. */
export interface DatetimeOptions {
	id?: string
	/** "date", "time" or "datetime". */
	subtype?: string
	dateLabel?: string
	timeLabel?: string
	validate?: FormValidation
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for taglist components. */
export interface TaglistOptions {
	id?: string
	values?: FormValueOption[]
	valuesKey?: string
	validate?: FormValidation
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for button components. */
export interface ButtonOptions {
	id?: string
	/** "submit" or "reset". */
	action?: string
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for dynamiclist components. */
export interface DynamicListOptions {
	id?: string
	path?: string
	isRepeating?: boolean
	allowAddRemove?: boolean
	defaultRepetitions?: number
	showOutline?: boolean
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for iframe components. */
export interface IframeOptions {
	id?: string
	label?: string
	height?: number
	security?: { allowScripts?: boolean }
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for image components. */
export interface ImageOptions {
	id?: string
	alt?: string
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for table components. */
export interface TableOptions {
	id?: string
	dataSource?: string
	rowCount?: number
	columns?: Array<{ label: string; key: string }>
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for html components. */
export interface HtmlOptions {
	id?: string
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for separator components. */
export interface SeparatorOptions {
	id?: string
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for spacer components. */
export interface SpacerOptions {
	id?: string
	height?: number
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for expression components. */
export interface ExpressionOptions {
	id?: string
	expression?: string
	/** "change" or "submit". */
	computeOn?: string
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for filepicker components. */
export interface FilepickerOptions {
	id?: string
	multiple?: boolean
	layout?: FormLayoutInput
	conditional?: FormConditional
}

/** Options for documentPreview components. */
export interface DocumentPreviewOptions {
	id?: string
	layout?: FormLayoutInput
	conditional?: FormConditional
}
