#!/usr/bin/env node
import "./quiet.js"
import { run } from "./run.js"

await run(process.argv.slice(2))
