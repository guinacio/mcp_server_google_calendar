#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { authorize } from './auth/auth.js';
import { google } from 'googleapis';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { CreateEventSchema, ListEventsSchema } from './schemas.js';
import { init, parseArgs } from './init.js';
import { coolLog, logs } from './utils/logs.js';
import { GOOGLE_CALENDAR_TOOLS } from './tools/tools.js';

// ----------
// init start

const commands = ['init', 'run'] as const;
const { executablePath, command } = parseArgs()
if (!commands.includes(command as(typeof commands)[number])) {
  console.error(`Invalid command: ${command}`);
  console.error(`Valid commands: ${commands.join(', ')}`);
  process.exit(1);
}

if (command === 'init') {
  coolLog(logs.init)
  init(executablePath)
  process.exit(0)
}

// init end
// --------

const server = new Server(
  {
    name: 'mcp_server_google_calendar',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: GOOGLE_CALENDAR_TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name: toolName, arguments: args } = request.params;
  const calendar = google.calendar('v3');

  try {
    if (toolName === 'get-events') {
      const { calendarId, timeMin, timeMax, maxResults } =
        ListEventsSchema.parse(args);

      const res = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        maxResults,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data),
          },
        ],
      };
    } else if (toolName === 'list-calendars') {
      const res = await calendar.calendarList.list();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data),
          },
        ],
      };
    } else if (toolName === 'check-availability') {
      const res = await calendar.freebusy.query({
        requestBody: args,
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data),
          },
        ],
      };
    } else if (toolName === 'create-event') {
      // TODO: give access to drive to add attachments
      const { calendarId, event } = CreateEventSchema.parse(args);
      const res = await calendar.events.insert({
        calendarId,
        requestBody: event,
        conferenceDataVersion: event.conferenceData ? 1 : 0,
        supportsAttachments: event.attachments ? true : false,
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res.data),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${toolName}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid arguments: ${error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
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
  console.error('Google calendar mcp running');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
