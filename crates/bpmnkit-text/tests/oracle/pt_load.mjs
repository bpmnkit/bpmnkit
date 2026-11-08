// Loads TS's process-text.js with its private helpers and `Reader` exported (they are not
// part of the package's public surface), for the oracle dump scripts next to it.
// CORE_DIST / FEEL_DIST override the built packages (default: this checkout, else the main one).
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { pathToFileURL } from "node:url"

const main = "/home/user/bpmnkit/"
const here = new URL("../../../../", import.meta.url).pathname
const root = existsSync(`${here}packages/core/dist/bpmn/process-text.js`) ? here : main
export const dist = process.env.CORE_DIST ?? `${root}packages/core/dist/`
const feelDist = process.env.FEEL_DIST ?? `${root}packages/feel/dist/index.js`

export async function loadProcessText() {
	const base = pathToFileURL(`${dist}bpmn/`).href
	let source = readFileSync(`${dist}bpmn/process-text.js`, "utf8")
	source = source
		.replaceAll('from "@bpmnkit/feel"', `from "${pathToFileURL(feelDist).href}"`)
		.replaceAll('from "../', `from "${pathToFileURL(dist).href}`)
		.replaceAll('from "./', `from "${base}`)
	source +=
		"\nexport { Reader, matching, handles, typeFromId, nameFromId, itemOf, listOf, variableFrom, OTHERWISE, DANGLING, HEADER_SEGMENT }\n"
	return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`)
}

/** The recorded process-text inputs (`conformance/text/*​/input.txt`), whole. */
export function conformanceInputs() {
	const dir = `${here}conformance/text/`
	return readdirSync(dir)
		.sort()
		.filter((name) => existsSync(`${dir}${name}/input.txt`))
		.map((name) => readFileSync(`${dir}${name}/input.txt`, "utf8"))
}
