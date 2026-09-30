import { createServer } from "node:http"
import { readFileSync, existsSync } from "node:fs"
import { dropPage } from "./src/lib/pages.ts"
const DRAFT = `# Order fulfillment
start[start Order placed] > pick[user Pick items] > pack[user Pack box]
pack > label[service Print label] > dispatch[user Dispatch package] > done[end Dispatched]`
createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://x")
  if (req.method === "POST" && url.pathname === "/drop/api/generate") {
    let body = ""; req.on("data", (c) => (body += c)); req.on("end", async () => {
      res.writeHead(200, { "content-type": "text/event-stream" })
      await new Promise(r => setTimeout(r, 2500))
      for (const line of DRAFT.split("\n")) { res.write(`data: ${JSON.stringify({ text: line + "\n" })}\n\n`); await new Promise(r => setTimeout(r, 600)) }
      res.end(`data: ${JSON.stringify({ done: true, cached: false })}\n\n`)
    }); return
  }
  const file = "public" + url.pathname
  if (url.pathname.startsWith("/drop/") && existsSync(file)) {
    res.writeHead(200, { "content-type": file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : "application/octet-stream" }); res.end(readFileSync(file)); return
  }
  res.writeHead(200, { "content-type": "text/html" }); res.end(dropPage("tos", true))
}).listen(8788)
