#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { authorize } from './auth/auth.js';
import { google } from 'googleapis';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { CreateEventSchema, ListEventsSchema } from './schemas.js';
import { init, parseArgs } from './init.js';
import { coolLog, logs } from './utils/logs.js';
import { GOOGLE_CALENDAR_TOOLS } from './tools/tools.js';
// ----------
// init start
const commands = ['init', 'run'];
const { executablePath, command } = parseArgs();
if (!commands.includes(command)) {
    console.error(`Invalid command: ${command}`);
    console.error(`Valid commands: ${commands.join(', ')}`);
    process.exit(1);
}
if (command === 'init') {
    coolLog(logs.init);
    init(executablePath);
    process.exit(0);
}
// init end
// --------
const server = new Server({
    name: 'mcp_server_google_calendar',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: GOOGLE_CALENDAR_TOOLS };
});

// Add this helper function after the imports
async function checkTimeSlotAvailability(calendar, calendarId, startTime, endTime) {
    const res = await calendar.freebusy.query({
        requestBody: {
            timeMin: startTime,
            timeMax: endTime,
            items: [{ id: calendarId }]
        }
    });

    const busySlots = res.data.calendars[calendarId].busy;
    return busySlots.length === 0;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name: toolName, arguments: args } = request.params;
    const calendar = google.calendar('v3');
    try {
        if (toolName === 'get-events') {
            const { calendarId, timeMin, timeMax, maxResults } = ListEventsSchema.parse(args);
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
        }
        else if (toolName === 'list-calendars') {
            const res = await calendar.calendarList.list();
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(res.data),
                    },
                ],
            };
        }
        else if (toolName === 'check-availability') {
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
        }
        else if (toolName === 'create-event') {
            const { calendarId, event } = CreateEventSchema.parse(args);
            
            // Check availability before creating the event
            const isAvailable = await checkTimeSlotAvailability(
                calendar,
                calendarId,
                event.start.dateTime,
                event.end.dateTime
            );

            if (!isAvailable) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                error: 'Time slot is not available - there are overlapping events',
                                status: 'CONFLICT'
                            })
                        }
                    ]
                };
            }

            // If available, proceed with event creation
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
        else if (toolName === 'delete-event') {
            const { calendarId, eventId, sendUpdates = 'all' } = args;
            const res = await calendar.events.delete({
                calendarId,
                eventId,
                sendUpdates
            });
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ success: true, status: res.status })
                    }
                ]
            };
        }
        else if (toolName === 'update-event') {
            const { calendarId, eventId, event } = args;
            
            // If updating time, check for availability
            if (event.start && event.end) {
                const isAvailable = await checkTimeSlotAvailability(
                    calendar,
                    calendarId,
                    event.start.dateTime,
                    event.end.dateTime
                );

                if (!isAvailable) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    error: 'New time slot is not available - there are overlapping events',
                                    status: 'CONFLICT'
                                })
                            }
                        ]
                    };
                }
            }

            // Proceed with update
            const res = await calendar.events.patch({
                calendarId,
                eventId,
                requestBody: event,
                sendUpdates: event.sendUpdates || 'all',
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(res.data)
                    }
                ]
            };
        }
        throw new Error(`Unknown tool: ${toolName}`);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid arguments: ${error.errors
                .map((e) => `${e.path.join('.')}: ${e.message}`)
                .join(', ')}`);
        }
        throw error;
    }
});
async function main() {
    const client = await authorize();
    google.options({ auth: client });
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`
    ╭-------------------------------------------╮
    │                                           │
    │      Google Calendar MCP Running          │
    │                                           │
    ╰-------------------------------------------╯`);
    
    await new Promise(() => {});
}
main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
