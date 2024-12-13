import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { authorize } from "./auth/auth.js";


const server = new Server({
  name: "mcp_server_google_calendar",
  version: "0.0.1",
}, {
  capabilities: {
    resources: {}
  }
});

async function main() {
  const client = await authorize();
  return
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google calendar mcp running");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
