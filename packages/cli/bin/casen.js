#!/usr/bin/env node
import { launch } from "../lib/launch.js"

process.exit(await launch("casen", import.meta.url))
