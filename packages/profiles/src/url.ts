/**
 * Joins a profile's `baseUrl` and an Orchestration Cluster API path such as `/deployments`.
 *
 * Profiles store the base URL with its `/v2` suffix (that is what `casen profile import` writes
 * and what `CamundaClient` expects), but hand-written profiles sometimes leave it off. Both
 * forms resolve to the same `…/v2/<path>` URL, so a caller never doubles or drops the version.
 */
export function clusterApiUrl(baseUrl: string, path: string): string {
	const base = baseUrl.replace(/\/+$/, "")
	const versioned = base.endsWith("/v2") ? base : `${base}/v2`
	return `${versioned}/${path.replace(/^\/+/, "")}`
}
