import { describe, expect, it } from "vitest"
import { UnknownConstructError, stripMdx } from "../src/mdx.js"

const file = "docs/example.md"

describe("stripMdx", () => {
	it("fails on an unrecognised component rather than dropping it", () => {
		expect(() => stripMdx("<SomeNewThing />", { file })).toThrow(UnknownConstructError)
	})

	it("names the file and line a human has to open", () => {
		const source = "one\ntwo\n<SomeNewThing />"
		expect(() => stripMdx(source, { file, lineOffset: 5 })).toThrow("docs/example.md:8")
	})

	it("keeps a marker that changes the meaning of the sentence", () => {
		const out = stripMdx("`now()` <MarkerCamundaExtension />", { file })
		expect(out).toBe("`now()` (Camunda extension)")
	})

	it("leaves a lowercase placeholder in prose alone", () => {
		const source = "Run `view <key>`, where <key> is the process key."
		expect(stripMdx(source, { file })).toBe(source)
	})

	it("turns an admonition into prose", () => {
		const out = stripMdx(":::note\nAvoid broad verbs.\n:::", { file })
		expect(out).toBe("**Note**\nAvoid broad verbs.")
	})

	it("keeps a tab label, which is a term someone would search for", () => {
		const source = '<Tabs>\n<TabItem value="vscode">\nUse the palette.\n</TabItem>\n</Tabs>'
		expect(stripMdx(source, { file })).toContain("### vscode")
	})

	it("renders an embedded diagram into the prose", () => {
		const out = stripMdx('<div bpmn="best-practices/gateway.bpmn" />', {
			file,
			renderBpmn: () => 'Diagram (BPMN):\n  start "Invoice to be checked"',
		})
		expect(out).toContain('start "Invoice to be checked"')
	})

	it("drops an embed whose diagram is missing, rather than failing the build", () => {
		const out = stripMdx('before\n<div bpmn="gone.bpmn" />\nafter', {
			file,
			renderBpmn: () => undefined,
		})
		expect(out).toBe("before\nafter")
	})

	it("inlines an imported partial instead of discarding its prose", () => {
		const source = 'import SaasPrereqs from "./_prereqs.md"\n\n<SaasPrereqs/>'
		const out = stripMdx(source, {
			file,
			readPartial: (path) => (path === "./_prereqs.md" ? "You need a cluster." : undefined),
		})
		expect(out).toBe("You need a cluster.")
	})

	it("unescapes the underscore Docusaurus escapes in a partial import", () => {
		const seen: string[] = []
		stripMdx('import P from "../react-components/\\_card.md"\n\n<P/>', {
			file,
			readPartial: (path) => {
				seen.push(path)
				return ""
			},
		})
		expect(seen).toEqual(["../react-components/_card.md"])
	})

	it("leaves fenced code untouched", () => {
		const source = "```tsx\n<SomeNewThing />\n```"
		expect(stripMdx(source, { file })).toBe(source)
	})

	it("keeps the answer in a comparison table cell", () => {
		const out = stripMdx("| Tasklist UI | <YesItem /> | <NoItem /> |", { file })
		expect(out).toBe("| Tasklist UI | Yes | No |")
	})

	it("drops a component imported from an image, whatever its name", () => {
		const source = 'import RegionLoss from "./img/region-loss.svg"\n\nBefore <RegionLoss /> after.'
		expect(stripMdx(source, { file })).toBe("Before  after.")
	})

	it("drops only the landing-page sections, not every component of that name", () => {
		const landing = [
			"import {",
			"  Components,",
			"  Installation,",
			'} from "@site/src/components/CamundaSelfManaged";',
			"",
			"<Components hideHeading/>",
		].join("\n")
		expect(stripMdx(landing, { file })).toBe("")
		expect(() => stripMdx("<Components />", { file })).toThrow(UnknownConstructError)
	})

	it("keeps an escaped tag, which is a placeholder in the sentence", () => {
		const source = "Click **Sync with \\<GitProvider\\>**."
		expect(stripMdx(source, { file })).toBe(source)
	})

	it("removes a tag whose props run over lines, props and all", () => {
		const source = [
			"Choose a client.",
			'<Tabs groupId="client" values={[',
			"{label: 'Java client', value: 'java-client' }",
			"]}>",
			'<TabItem value="java-client">',
			"Add the dependency.",
			"</TabItem>",
			"</Tabs>",
		].join("\n")
		expect(stripMdx(source, { file })).toBe(
			"Choose a client.\n\n### java-client\n\nAdd the dependency.",
		)
	})

	it("ends a tag at its own `>`, not one inside a prop", () => {
		const source = [
			"<StateContainer",
			'current={<img src={Four} alt="Current" style={{border: "none"}} />}',
			"/>",
			"Then promote the writer.",
		].join("\n")
		expect(stripMdx(source, { file })).toBe("Then promote the writer.")
	})

	it("resolves a partial's own import from the partial's directory", () => {
		const files: Record<string, string> = {
			"./config/_memory.md": 'import Backends from "./_backends.md"\n\n<Backends />',
			"config/_backends.md": "Store memory in a document.",
		}
		const out = stripMdx('import Memory from "./config/_memory.md"\n\n<Memory />', {
			file,
			readPartial: (path) => files[path],
		})
		expect(out).toBe("Store memory in a document.")
	})

	it("renders the part of a partial that the including tag's attributes select", () => {
		const files: Record<string, string> = {
			"./_response.md": [
				'import ProcessFields from "./_process.md"',
				'import TaskFields from "./_task.md"',
				"",
				"Configure the response.",
				'{props.type === "process" && <ProcessFields />}',
				'{props.type === "task" && <TaskFields />}',
			].join("\n"),
			"_process.md": "Process fields.",
			"_task.md": "Task fields.",
		}
		const out = stripMdx('import Response from "./_response.md"\n\n<Response type="process" />', {
			file,
			readPartial: (path) => files[path],
		})
		expect(out).toBe("Configure the response.\n\nProcess fields.")
	})

	it("removes an HTML tag whose props run over lines, keeping its text", () => {
		const source = [
			"<a",
			"  className={clsx(",
			'    "button button--lg"',
			"  )}",
			'  href="https://example.com">',
			"  Sign up",
			"</a>",
		].join("\n")
		expect(stripMdx(source, { file }).trim()).toBe("Sign up")
	})

	it("joins a card grid of a few dozen lines", () => {
		const items = Array.from({ length: 12 }, (_, i) =>
			[
				"{",
				`link: "./page-${i}",`,
				`title: "Page ${i}",`,
				`description: "About ${i}.",`,
				"},",
			].join("\n"),
		)
		const source = `<AoGrid ao={[\n${items.join("\n")}\n]} />\nAfter the grid.`
		expect(stripMdx(source, { file })).toBe("After the grid.")
	})
})
