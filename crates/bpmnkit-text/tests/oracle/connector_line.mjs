// Dumps TS's parseConnectorLine results into connector_line.json.
// Run from the repo root: node crates/bpmnkit-text/tests/oracle/connector_line.mjs
import { writeFileSync } from "node:fs"
import { parseConnectorLine } from "../../../../packages/core/dist/bpmn/connector-line.js"

const lines = [
	'with post: slack chat.postMessage | data.channel=#ops | data.text== "Order " + orderId',
	"with fetch: http GET https://api.example.com/orders | result=order",
	"WITH a.b-c :  HTTPS://Example.com/X  |  2=two b=1 a=x | token*={{secrets.T}}",
	"with x: | a=1",
	'with x: rest | =bad | k=(a | b) c=\'q|r\' d="x\\" y" | ünï=1 | 1abc=2',
	"with y:\u00a0Mail\u2003send | to=a@b.c\u3000subject=Hi there",
	"with z: alias | a==x == 1 b=2",
	"with q: alias | thisisaverylongpartwithoutanyequalsign😀😀😀😀more",
	"without: x",
	"with 1x: y",
	"  with t: tool  ",
]
const cases = lines.map((text, i) => {
	const problems = []
	const result = parseConnectorLine(text, i + 1, problems)
	return { text, line: i + 1, result: result ?? null, problems }
})
writeFileSync(
	new URL("./connector_line.json", import.meta.url),
	`${JSON.stringify(cases, null, "\t")}\n`,
)
