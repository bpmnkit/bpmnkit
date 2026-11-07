// Dumps the state TS's (unexported) `Reader` is left in after reading lines into
// pt_reader.json. Run from the repo root:
//   node crates/bpmnkit-text/tests/oracle/pt_reader.mjs
import { writeFileSync } from "node:fs"
import { conformanceInputs, loadProcessText } from "./pt_load.mjs"

const m = await loadProcessText()
const nul = (v) => (v === undefined ? null : v)
// `JSON.stringify` drops `undefined`, as serde's skip_serializing_if does.
const plain = (v) => JSON.parse(JSON.stringify(v))

function state(reader) {
	return plain({
		nodes: [...reader.nodes].map(([id, node]) => ({
			id,
			element: node.element,
			// `Object.entries` order, which JSON objects in the dump lose in Rust.
			inputs: node.element.inputs ? Object.entries(node.element.inputs) : null,
			outputs: node.element.outputs ? Object.entries(node.element.outputs) : null,
			line: node.line,
			spec: node.spec,
			on: nul(node.on),
			inside: nul(node.inside),
		})),
		current: [...reader.current],
		declared: [...reader.declared],
		taken: [...reader.taken],
		edges: reader.edges.map((e) => ({
			from: e.from,
			to: e.to,
			name: nul(e.name),
			condition: nul(e.condition),
			isDefault: nul(e.isDefault),
			line: e.line,
		})),
		problems: reader.problems,
		fixes: reader.fixes,
		connectors: reader.connectors,
		notes: reader.notes,
		docs: reader.docs,
		guessedMessage: [...reader.guessedMessage],
		title: nul(reader.title),
		platformVersion: nul(reader.platformVersion),
		carry: reader.carry ? [reader.carry.text, reader.carry.line] : null,
		tail: nul(reader.tail),
	})
}

function run(lines, finish = true) {
	const reader = new m.Reader()
	const returns = lines.map((line, k) => reader.line(line, k + 1))
	const finished = finish ? reader.finish() : null
	return { lines, returns, finished, state: state(reader) }
}

const cases = []

// The recorded inputs, as parseProcessText splits them.
for (const input of conformanceInputs()) cases.push(run(input.split(/\r?\n/)))

const handwritten = [
	["a[task A] > b[task B]", "a > c[task C]"],
	["# Order | camunda=8.10", "a[start Go] > b[end Done]"],
	["# Order | Payment flow | camunda=8.10.1", "a[start Go]"],
	["# Order | camunda=8.10 | camunda=9", "a[start Go]"],
	["# | camunda=8.10", "# Second", "a[start Go]"],
	["# Title", "# Other | camunda=8.11"],
	["## Title | camunda=8", "# camunda=8.10 | camunda=8.10"],
	["# T | foo=1, bar | camunda=8.10 | camunda=1.2.3.4"],
	["# T | camunda=8.10=x"],
	["# T | camunda=8.x", "# T | camunda"],
	["```", "// comment", "", "   ", "a[task A]"],
	["a[task A] >", "b[task B]", "b > c[end C]"],
	["a[task A] >(Yes: x > 1)", "", "b[task B]"],
	["a[task A] >", "   "],
	["a[task A] >"],
	["a[task A] >(No: default)"],
	["a[task A] >", "> b[task B]"],
	["a[task A]", "> b[task B]", "-> c[task C]", "--> d"],
	["a[task A]", "b[task B] >", "> c[task C]"],
	[
		"a[task A] > b[task B]",
		"note a: This is a note",
		"NOTE b : Another",
		"doc a: Docs here",
		"note zz: unknown",
		"doc a:",
	],
	["a[task A] > a[task B]", "note a: after redeclare", "a[task C]", "doc a: x"],
	["with a: http GET https://x.test | result=r", "a[task A]", "with a: http GET https://y.test"],
	["a[task A] > b[task B]", "with b: slack post | text=hi", "with zzz: foo", "with a:"],
	["a[task A]", "a[task A]", "A[task a]", "a[task  A]"],
	["a[task A]", "a[user B]"],
	["a[task A] > a[user B]"],
	["a[task A] > a[user B] > a[end C]"],
	["a[task A]", "a[boundary:error Failed | on=a]"],
	["a[task A]", "a[boundary:error Failed | on=a]", "a[boundary:timer Late | on=a]"],
	["a[task A]", "x > a[boundary:error Failed | on=a]"],
	["a[task A]", "a[kind and]"],
	["a[task A]", "a[id=a kind=start]"],
	["a[task A]", "a[task send email to the team]"],
	["a[task A]", "x > a[post Slack message to #support]"],
	["a[task A]", "x > a[task Do | it=now]"],
	["a[task A]", "x > a[xor Is it ok?]"],
	["a[task A]", "x > a[xor]"],
	["a[task A]", "a[xor]"],
	["a[task A]", "a[]", "a[ ]"],
	["a[]"],
	["a[ ] > b"],
	["a[start]"],
	["a[start Go]", "b[end]", "c[task]"],
	[
		"start[Order placed]",
		"end_it[Order done]",
		"x[Something]",
		"and[Join]",
		"xor[Check]",
		"Finish[Done]",
	],
	["a[unknownkind Do it]", "b[Task: Do it]", "c[:x]", "d[: x]"],
	["a[START Go]", "b[Service Call]", "c[EVENTGW Wait]", "d[Xor: Check]"],
	[
		"a[event Wait]",
		"b[parallel Fork]",
		"c[exclusive Pick]",
		"d[gateway Pick]",
		"e[inclusive Any]",
		"f[decision Rule]",
		"g[dmn Rule]",
		"h[human Review]",
	],
	[
		"a[start:message Order]",
		"b[start:Message Order]",
		"c[end:error Failed]",
		"d[catch:timer Wait | after=PT5M]",
		"e[throw:signal Sent]",
		"f[boundary:escalation Esc | on=a]",
	],
	[
		"a[start:order received]",
		"b[start:kyc Start KYC]",
		"c[start:KYC start kyc check]",
		"d[task:message Do]",
		"e[start:]",
		"f[start: x]",
		"g[start:?x]",
		"h[start:x?]",
		"i[start:!]",
	],
	[
		"a[start:link Go]",
		"b[catch:link Wait]",
		"c[throw:link Go]",
		"d[end:link Go]",
		"e[boundary:link Go | on=a]",
	],
	["a[catch Wait]", "b[catch]", "c[boundary Trouble | on=a]", "d[event]", "e[catch:timer]"],
	["a[task A]", "b[boundary:error Failed | on=a]", "c[boundary:error]", "d[boundary]"],
	[
		"q[event catch Send to SQS]",
		"q2[catch Post a note]",
		"q3[event notify team]",
		"q4[catch Invoke API]",
		"q5[catch Sender]",
		"q6[catch Run\nx]",
		"q7[throw Call it]",
		"q8[catch Send]",
		"q9[catch send]",
		"q10[CATCH SEND IT]",
	],
	[
		"a[task A]",
		"late[catch:timer | on=a after=PT5M]",
		"l2[catch Wait | on=a]",
		"l3[catch Wait | on=zzz]",
		"l4[catch Wait | on=l2]",
	],
	[
		"a[task A]",
		"late[boundary:timer on=a after=5m]",
		"l2[boundary:timer Wait on=a nonint]",
		"l3[task Do job=x result=y each=zs]",
	],
	[
		"a[task A | job=x.y]",
		"b[service B | job=t, result=r]",
		"c[send C | job=]",
		"d[service D | job]",
	],
	[
		"a[task A | nonint]",
		"b[task B | nonint=1]",
		"c[task C | nonint=]",
		"d[boundary:error X | on=a | nonint]",
	],
	[
		"a[start Go | form=f1]",
		"b[user Review | form=f2]",
		"c[task Do | form=f3]",
		"d[user U | form=]",
		"e[user E | form]",
	],
	[
		"a[task Do | each=items]",
		"b[service Do | each==items]",
		"c[and Process every recipient | each=recipients]",
		"d[and Join | each=xs]",
		"e[xor Handle each | each=categories]",
		"f[start S | each=xs]",
		"g[task T | each=my list]",
		"h[task T | each=cities]",
		"i[task T | each=boxes]",
		"j[task T | each=class]",
	],
	[
		"a[task Send email to each stakeholder]",
		"b[user Review every invoice]",
		"c[task Run each day]",
		"d[task Notify each company]",
		"e[task Ping each key]",
		"f[task Tag each category | each=cats]",
		"g[xor Each item?]",
		"h[task Do every Day]",
		"i[task Do each other]",
		"j[subprocess x each y]",
		"k[task Do each ab]",
		"l[task Do each abc1]",
		"m[task Do each\u00a0recipient]",
	],
	[
		"a[start Go | after=PT5M]",
		"b[end X | after=PT5M]",
		"c[catch:timer Wait | after=5 minutes]",
		"d[boundary:error Timeout | on=a after=P1D]",
		"e[task T | after=PT5M]",
		"f[catch Wait | after=nonsense]",
		"g[catch:timer Wait 5 minutes]",
		"h[boundary:timer Wait for 2 hours | on=a]",
		"i[catch:timer Wait PT1H | after=bad]",
	],
	[
		"a[task A | result=x]",
		"b[start S | result=x]",
		"c[script Calc | feel=1+1]",
		"d[task Calc | feel=1 + 1]",
		"e[script Calc | result=r feel== 1]",
		"f[task Calc | feel=]",
		"g[user U | feel=1]",
		"h[script S | feel=1 +]",
		"i[task T | feel==]",
		"j[script S | feel=a b c]",
	],
	[
		"a[service Call | in.x=1 out.y=a = 1]",
		"b[task T | in.x= out.y=2]",
		"c[task T | in.x==foo in.x=bar]",
		"d[task T | in.x=1 +]",
		"e[task T | out.y=a, b | job=x]",
		"f[task T | in.__proto__=1]",
		"g[task T | in.a=1 | out.a=2 | in.b=3]",
	],
	[
		"a[task A | x=1]",
		"b[task B | unknownattr]",
		"c[task C | =1]",
		"d[task D | on=]",
		"e[task E | on=a=b]",
		"f[task F | job=x=y]",
	],
	[
		"a[task A]",
		"b[task B | on=a]",
		"c[boundary:error E | on=a]",
		"d[boundary:error E | on=b]",
		"e[boundary:error E | on=zzz]",
	],
	[
		"a[adhoc Agent]",
		"t[service Tool | inside=a]",
		"u[service Tool2 | inside=zzz]",
		"v[service Tool3 | inside=a]",
	],
	[
		"pay[service Pay]",
		"pay[boundary:error Failed | on=pay]",
		"x > pay[boundary:error Failed2 | on=pay]",
	],
	[
		"a[task A] >(Yes: x > 1) b[task B] >(No: default) c[task C] >(Other: prose here) d",
		"d >(Maybe) e >(default) f >(: x) g >() h",
	],
	["a >(Name: not feel here) b", "a >(Big: order total > 100) b", "a >(=) b", "a >(Name: =) b"],
	["a > b > c > d", "d > a"],
	["a -> b --> c", "c ---> d"],
	["(note) a"],
	["a[task A] (ADDED)", "b[task B] (x"],
	["call back[service Call back] > 1[xor Is it?] > 2", "1abc--> x"],
	["a[task A] b", "a[task A", "a[task A] > b[task B"],
	["a > b", "b[task B] > c"],
	["a[task A] > end Done", "x > xor Is it ok? >(Yes: y) done", "x > end  > z"],
	[
		"constructor[task X] > toString Do it",
		"toString[task Y]",
		"valueOf[end Z]",
		"__proto__[task W]",
		"hasOwnProperty Run it > b",
	],
	["note a: x\u2028y", "doc a: x\ny", "note a:\u00a0 x ", "Doc A : text"],
	["a[task A]\r", "b[task B]\r", "note a: x\r"],
	["\ufeffa[task A]", "\u00a0b[task B]\u00a0", "\u2003c[task C]"],
	["a[task Ünï cödé 😀] > b[end 日本語]", "Ünï > b"],
	["a[task A | on=a]"],
	["a[start S]", "b[start S2]", "a[task A2]", "b[task B2]"],
	["a[task A]", "b[task B]", "b[task A]", "a[task B]"],
	["x[task X]", "x_2[task Y]", "x[task Z]", "x[task W]"],
	["a[task A] > a[task A] > a"],
	["a[Task A] > a[task a]"],
	["a[TASK  A]", "a[task A]"],
	["a[task A | x=1]", "a[task A | x=1]", "a[task A | X=1]"],
	["a[boundary:error E | on=a]"],
	["with a: http | x=1", "# Late title", "with a: bar"],
	["a[task A]", "with a: http | x=1", "a[user B]", "with a: http | x=2"],
	["a[task A] > b", "```json", "b > c", "```"],
	["// a > b", "//a > b", " // a > b"],
	["#", "#  ", "# ", "###"],
	["#title", "a"],
]
for (const lines of handwritten) cases.push(run(lines))
// `Object.prototype` members are not kind words: an unknown kind, or a plain id after an arrow.
for (const lines of [
	["a > constructor stuff", "a > __proto__ stuff"],
	["a[constructor X]"],
	["a[__proto__ X]", "b[toString X]"],
	["b[task B]", "b[constructor X]", "b[__proto__ Y]"],
]) {
	cases.push(run(lines))
}
// A line left waiting at the end, with and without `finish()`.
cases.push(
	run(["a[task A] >"], false),
	run(["a[task A] > b[task B] >(x)"], false),
	run(["a >(Yes"], true),
)

// Every prefix-cut of a few recorded lines, read after the node they refer to.
const seen = new Set()
for (const input of conformanceInputs()) {
	for (const raw of input.split(/\r?\n/)) {
		const line = raw.trim()
		if (line.length < 12 || line.startsWith("#") || seen.has(line)) continue
		seen.add(line)
		if (seen.size % 4 !== 0) continue
		const cuts = []
		for (let k = 4; k < line.length; k += 9) cuts.push(line.slice(0, k))
		cases.push(run(["pre[task Pre]", ...cuts, line]))
	}
}

writeFileSync(new URL("./pt_reader.json", import.meta.url), `${JSON.stringify({ cases })}\n`)
