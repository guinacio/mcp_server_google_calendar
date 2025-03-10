const EMAIL_DOMAIN = '@gmail.com';
export const GOOGLE_CALENDAR_TOOLS = [
    {
        name: 'get-events',
        description: 'Get events from calendar',
        inputSchema: {
            type: 'object',
            properties: {
                calendarId: {
                    type: 'string',
                    description: 'The ID of the calendar to get events from',
                },
                timeMin: {
                    type: 'string',
                    description: 'The minimum time to get events from',
                },
                timeMax: {
                    type: 'string',
                    description: 'The maximum time to get events from',
                },
                maxResults: {
                    type: 'number',
                    description: 'The maximum number of events to return',
                },
            },
            required: ['calendarId'],
        },
    },
    {
        name: 'list-calendars',
        description: 'List all calendars',
        inputSchema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'check-availability',
        description: 'Check availability for yourself and/or others. When checking for other people in the organization, their emails will always be their name and then ' +
            EMAIL_DOMAIN,
        inputSchema: {
            type: 'object',
            properties: {
                calendarExpansionMax: {
                    type: 'number',
                    description: 'Maximal number of calendars for which FreeBusy information is to be provided. Optional. Maximum value is 50.',
                },
                groupExpansionMax: {
                    type: 'number',
                    description: 'Maximal number of calendar identifiers to be provided for a single group. Optional. An error is returned for a group with more members than this value. Maximum value is 100.',
                },
                items: {
                    type: 'array',
                    description: 'List of calendars and/or groups to query for FreeBusy information. Optional.',
                    items: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'string',
                                description: 'The identifier of a calendar or a group.',
                            },
                        },
                    },
                },
                timeMax: {
                    type: 'string',
                    description: 'The end of the interval for the query formatted as per RFC3339.',
                },
                timeMin: {
                    type: 'string',
                    description: 'The start of the interval for the query formatted as per RFC3339.',
                },
                timeZone: {
                    type: 'string',
                    description: 'Time zone used in the response. Optional. The default is UTC.',
                },
            },
            required: [],
        },
    },
    {
        name: 'create-event',
        description: 'Create an event in Google Calendar',
        inputSchema: {
            type: 'object',
            properties: {
                calendarId: {
                    type: 'string',
                    description: "The ID of the calendar to create the event in. Use 'primary' for the user's primary calendar.",
                },
                event: {
                    type: 'object',
                    description: 'The event to create',
                    properties: {
                        summary: {
                            type: 'string',
                            description: 'Title of the event',
                        },
                        description: {
                            type: 'string',
                            description: 'Description of the event. Can contain HTML.',
                        },
                        location: {
                            type: 'string',
                            description: 'Geographic location of the event as free-form text',
                        },
                        colorId: {
                            type: 'string',
                            description: 'The color of the event. Optional. See the Calendar UI for the list of available colors.',
                        },
                        start: {
                            type: 'object',
                            description: 'The start time of the event',
                            properties: {
                                dateTime: {
                                    type: 'string',
                                    description: "The start time of the event formatted as per RFC3339 (e.g., '2024-12-14T09:00:00-07:00')",
                                },
                                timeZone: {
                                    type: 'string',
                                    description: "The time zone of the start time (e.g., 'America/Los_Angeles'). Defaults to calendar's time zone",
                                },
                            },
                            required: ['dateTime'],
                        },
                        end: {
                            type: 'object',
                            description: 'The end time of the event',
                            properties: {
                                dateTime: {
                                    type: 'string',
                                    description: "The end time of the event formatted as per RFC3339 (e.g., '2024-12-14T10:00:00-07:00')",
                                },
                                timeZone: {
                                    type: 'string',
                                    description: "The time zone of the end time. Defaults to calendar's time zone",
                                },
                            },
                            required: ['dateTime'],
                        },
                        recurrence: {
                            type: 'array',
                            description: 'List of RRULE, EXRULE, RDATE and EXDATE lines for a recurring event',
                            items: {
                                type: 'string',
                                description: "Recurrence rule in iCalendar format (e.g., 'RRULE:FREQ=WEEKLY;COUNT=10;BYDAY=TU')",
                            },
                        },
                        attendees: {
                            type: 'array',
                            description: 'The attendees of the event',
                            items: {
                                type: 'object',
                                properties: {
                                    email: {
                                        type: 'string',
                                        description: "The attendee's email address",
                                    },
                                    displayName: {
                                        type: 'string',
                                        description: "The attendee's name, if available",
                                    },
                                    optional: {
                                        type: 'boolean',
                                        description: 'Whether this is an optional attendee',
                                        default: false,
                                    },
                                    responseStatus: {
                                        type: 'string',
                                        description: "The attendee's response status",
                                        enum: ['needsAction', 'declined', 'tentative', 'accepted'],
                                        default: 'needsAction',
                                    },
                                    comment: {
                                        type: 'string',
                                        description: "The attendee's response comment",
                                    },
                                    additionalGuests: {
                                        type: 'integer',
                                        description: 'Number of additional guests',
                                        minimum: 0,
                                        default: 0,
                                    },
                                },
                                required: ['email'],
                            },
                        },
                        attachments: {
                            type: 'array',
                            description: 'File attachments for the event (Google Drive files only)',
                            items: {
                                type: 'object',
                                properties: {
                                    fileId: {
                                        type: 'string',
                                        description: 'ID of the Google Drive file',
                                    },
                                    fileUrl: {
                                        type: 'string',
                                        description: 'URL of the file in Google Drive',
                                    },
                                    title: {
                                        type: 'string',
                                        description: 'Title of the attachment',
                                    },
                                    mimeType: {
                                        type: 'string',
                                        description: 'MIME type of the attachment',
                                    },
                                },
                                required: ['fileId'],
                            },
                            maxItems: 25,
                        },
                        reminders: {
                            type: 'object',
                            description: 'Reminders for the event',
                            properties: {
                                useDefault: {
                                    type: 'boolean',
                                    description: 'Whether to use the default reminders of the calendar',
                                    default: true,
                                },
                                overrides: {
                                    type: 'array',
                                    description: 'Custom reminders for the event',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            method: {
                                                type: 'string',
                                                description: 'The method used by this reminder',
                                                enum: ['email', 'popup'],
                                            },
                                            minutes: {
                                                type: 'integer',
                                                description: 'Number of minutes before the event to trigger the reminder',
                                            },
                                        },
                                        required: ['method', 'minutes'],
                                    },
                                },
                            },
                        },
                        visibility: {
                            type: 'string',
                            description: 'Visibility of the event',
                            enum: ['default', 'public', 'private', 'confidential'],
                            default: 'default',
                        },
                        transparency: {
                            type: 'string',
                            description: 'Whether the event blocks time on the calendar',
                            enum: ['opaque', 'transparent'],
                            default: 'opaque',
                        },
                        conferenceData: {
                            type: 'object',
                            description: 'Conference-related information',
                            properties: {
                                createRequest: {
                                    type: 'object',
                                    description: 'Request to create a new conference',
                                    properties: {
                                        requestId: {
                                            type: 'string',
                                            description: 'Client-generated unique ID for this request',
                                        },
                                        conferenceSolutionKey: {
                                            type: 'object',
                                            properties: {
                                                type: {
                                                    type: 'string',
                                                    description: "Conference solution type (e.g., 'hangoutsMeet')",
                                                },
                                            },
                                            required: ['type'],
                                        },
                                    },
                                    required: ['requestId'],
                                },
                            },
                        },
                    },
                    required: ['summary', 'start', 'end'],
                },
            },
            required: ['calendarId', 'event'],
        },
    },
    {
        name: 'delete-event',
        description: 'Delete an event from Google Calendar',
        inputSchema: {
            type: 'object',
            properties: {
                calendarId: {
                    type: 'string',
                    description: "The ID of the calendar containing the event. Use 'primary' for the user's primary calendar.",
                },
                eventId: {
                    type: 'string',
                    description: 'The ID of the event to delete',
                },
                sendUpdates: {
                    type: 'string',
                    description: 'Whether to send notifications about the deletion to all attendees',
                    enum: ['all', 'externalOnly', 'none'],
                    default: 'all'
                }
            },
            required: ['calendarId', 'eventId']
        }
    },
    {
        name: 'update-event',
        description: 'Update an existing event in Google Calendar',
        inputSchema: {
            type: 'object',
            properties: {
                calendarId: {
                    type: 'string',
                    description: "The ID of the calendar containing the event. Use 'primary' for the user's primary calendar.",
                },
                eventId: {
                    type: 'string',
                    description: 'The ID of the event to update',
                },
                event: {
                    type: 'object',
                    description: 'The updated event details. Only specified fields will be updated.',
                    properties: {
                        summary: {
                            type: 'string',
                            description: 'Title of the event',
                        },
                        description: {
                            type: 'string',
                            description: 'Description of the event. Can contain HTML.',
                        },
                        location: {
                            type: 'string',
                            description: 'Geographic location of the event as free-form text',
                        },
                        colorId: {
                            type: 'string',
                            description: 'The color of the event',
                        },
                        start: {
                            type: 'object',
                            properties: {
                                dateTime: {
                                    type: 'string',
                                    description: 'RFC3339 timestamp',
                                },
                                timeZone: {
                                    type: 'string',
                                    description: 'Time zone',
                                },
                            },
                        },
                        end: {
                            type: 'object',
                            properties: {
                                dateTime: {
                                    type: 'string',
                                    description: 'RFC3339 timestamp',
                                },
                                timeZone: {
                                    type: 'string',
                                    description: 'Time zone',
                                },
                            },
                        },
                        attendees: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    email: {
                                        type: 'string',
                                        description: "The attendee's email address",
                                    },
                                    displayName: {
                                        type: 'string',
                                        description: "The attendee's name, if available",
                                    },
                                    optional: {
                                        type: 'boolean',
                                        description: 'Whether this is an optional attendee',
                                    },
                                },
                                required: ['email'],
                            },
                        },
                        sendUpdates: {
                            type: 'string',
                            description: 'Whether to send notifications about the update to all attendees',
                            enum: ['all', 'externalOnly', 'none'],
                            default: 'all'
                        }
                    }
                }
            },
            required: ['calendarId', 'eventId', 'event'],
        },
    },
];
