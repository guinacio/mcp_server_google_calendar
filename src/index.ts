import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { authorize } from "./auth/auth.js";
import { google } from "googleapis";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { EventSchema } from "./schemas.js";

const server = new Server({
  name: "mcp_server_google_calendar",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get-events",
        description: "Get events from calendar",
        inputSchema: {
          type: "object",
          properties: {
            calendarId: {
              type: "string",
              description: "The ID of the calendar to get events from",
            },
            timeMin: {
              type: "string",
              description: "The minimum time to get events from",
            },
            timeMax: {
              type: "string",
              description: "The maximum time to get events from",
            },
            maxResults: {
              type: "number",
              description: "The maximum number of events to return",
            },
          },
          required: ["calendarId"],
        },
      },
    ]
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name: toolName, arguments: args } = request.params;
  const calendar = google.calendar("v3");

  try {
    if (toolName === "get-events") {

      const { calendarId, timeMin, timeMax, maxResults } = EventSchema.parse(args);
      
      const res = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        maxResults,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(res.data)
          }
        ]
      }
    }

    throw new Error(`Unknown tool: ${toolName}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid arguments: ${error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ")}`
      );
    }
    throw error;
  }
});

async function main() {
  const client = await authorize();
  google.options({ auth: client });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google calendar mcp running");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
