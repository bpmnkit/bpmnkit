/**
 * What a **Try it** run does with a job: a generated process is tried against
 * the APIs it reads, without acting on any system (`doc/ai-connector-generation-plan.md`
 * WS7). Only a GET of the REST connector goes out; any other method, any other
 * connector and any other job is simulated, because it would change something
 * real or needs secrets.
 */
export function tryItDecision(
	jobType: string,
	method: string | undefined,
): { send: true } | { send: false; note: string } {
	if (jobType !== "io.camunda:http-json:1") {
		return { send: false, note: "Try it simulates every connector but GET requests" }
	}
	const verb = (method ?? "GET").toUpperCase()
	return verb === "GET"
		? { send: true }
		: { send: false, note: `${verb} not sent: Try it only sends GET requests` }
}
