import { spawn } from "node:child_process"
import type { Command, CommandGroup } from "../types.js"

/** The reebe-server command line for `casen reebe start`. */
export function serverArgs(port: number, configPath: string, grpcPort?: number): string[] {
	const args = ["--port", String(port), "--config", configPath]
	// Passed only when set, so an older reebe-server without the flag still starts.
	if (grpcPort !== undefined) args.push("--grpc-port", String(grpcPort))
	return args
}

const startCmd: Command = {
	name: "start",
	description: "Start the Reebe workflow engine (Zeebe-compatible REST API)",
	flags: [
		{
			name: "port",
			description: "HTTP port to listen on",
			type: "number",
			default: 8080,
		},
		{
			name: "grpc-port",
			description: "Zeebe gRPC gateway port (default 26500). Must differ from --port",
			type: "number",
		},
		{
			name: "database-url",
			description:
				"PostgreSQL database URL. Omit to use embedded SQLite (no external database required).",
			type: "string",
			placeholder: "postgres://user:pass@host/db",
		},
		{
			name: "config",
			description: "Path to config.toml",
			type: "string",
			default: "config.toml",
			placeholder: "PATH",
		},
	],
	examples: [
		{
			description: "Start with embedded SQLite (no external database required)",
			command: "casen reebe start",
		},
		{
			description: "Start with PostgreSQL",
			command: "casen reebe start --database-url postgres://user:pass@localhost/reebe",
		},
		{ description: "Start on a custom port", command: "casen reebe start --port 9090" },
		{
			description: "Serve REST on 26500, where ZEEBE_ADDRESS points by default",
			command: "casen reebe start --port 26500 --grpc-port 26501",
		},
	],
	async run(ctx) {
		const port = (ctx.flags.port as number | undefined) ?? 8080
		const grpcPort = ctx.flags["grpc-port"] as number | undefined
		const dbUrl = ctx.flags["database-url"] as string | undefined
		const configPath = (ctx.flags.config as string | undefined) ?? "config.toml"

		ctx.output.info(`Starting Reebe workflow engine on port ${port}...`)
		ctx.output.info(dbUrl ? `Database: ${dbUrl}` : "Database: embedded SQLite")
		ctx.output.info("Press Ctrl+C to stop\n")

		const args = serverArgs(port, configPath, grpcPort)
		const env: NodeJS.ProcessEnv = { ...process.env, REEBE_PORT: String(port) }
		if (dbUrl) env.REEBE_DATABASE_URL = dbUrl

		await new Promise<void>((resolve, reject) => {
			const child = spawn("reebe-server", args, { stdio: "inherit", env })

			child.on("error", (err) => {
				const code = (err as NodeJS.ErrnoException).code
				if (code === "ENOENT") {
					reject(
						new Error(
							[
								"reebe-server not found.",
								"Build from source:",
								"  cargo install --path apps/reebe/crates/reebe-server --no-default-features --features embedded",
								"(drop the feature flags for the PostgreSQL build, which needs --database-url)",
							].join("\n"),
						),
					)
				} else {
					reject(err)
				}
			})

			child.on("close", (exitCode) => {
				if (exitCode === 0 || exitCode === null) resolve()
				else reject(new Error(`Reebe engine exited with code ${exitCode}`))
			})
		})
	},
}

export const reebeGroup: CommandGroup = {
	name: "reebe",
	description: "Start the Reebe workflow engine (drop-in Zeebe replacement, ~50 MB)",
	commands: [startCmd],
}
