# Google Calendar MCP Server

A Model Context Protocol (MCP) server that allows Claude to interact with Google Calendar. This server enables Claude to manage your calendar events, check availability, and handle scheduling tasks.

## Features

### Calendar Management
- **List Events** (`get-events`)
  - View events from any calendar
  - Filter by time range
  - Limit number of results
  
- **List Calendars** (`list-calendars`)
  - View all available calendars
  - Access calendar IDs and settings

### Event Operations
- **Create Events** (`create-event`)
  - Schedule new events
  - Add attendees
  - Set reminders
  - Include conference links
  - Attach files (Google Drive)
  - Set visibility and transparency
  - Configure recurring events

- **Update Events** (`update-event`)
  - Modify existing events
  - Change time/date
  - Add/remove attendees
  - Update any event details
  - Control notification settings

- **Delete Events** (`delete-event`)
  - Remove events from calendar
  - Control notification settings for attendees

### Availability Management
- **Check Availability** (`check-availability`)
  - Check free/busy status
  - Support for multiple calendars
  - Time zone awareness

## Requirements

- Node.js >= v18.0.0
- Claude Desktop
- Google Cloud Console Project with Calendar API enabled
- OAuth 2.0 credentials

## Installation

1. **Set up Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google Calendar API
   - Create OAuth 2.0 credentials
   - Download credentials and save as `credentials.json` in your project root

2. **Initialize the Server**
   ```bash
   npx mcp-server-google-calendar init
   ```
   This will:
   - Create necessary configurations
   - Add the server to Claude's MCP configuration

3. **Start the Server**
   ```bash
   npx mcp-server-google-calendar run
   ```

4. **Configure Claude Desktop**
   The init command automatically adds the configuration to:
   - Windows: `C:\Users\USER_NAME\AppData\Roaming\Claude\claude_desktop_config.json`
   - MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   
   The configuration should look like:
   ```json
   {
     "mcpServers": {
       "google_calendar": {
         "command": "npx",
         "args": ["-y", "mcp-server-google-calendar", "run"]
       }
     }
   }
   ```

5. **Restart Claude Desktop**
   - Close and reopen Claude Desktop to load the new configuration

## Example Commands

Here are some things you can ask Claude:

### Event Creation
- "Create an event called 'Team Meeting' for tomorrow at 2pm"
- "Schedule a recurring meeting every Monday at 10am"
- "Set up a video call with John for next Tuesday afternoon"

### Event Management
- "Move my 2pm meeting to 4pm"
- "Add Jane (jane@example.com) to tomorrow's team meeting"
- "Cancel my meeting with John"
- "Update the location of today's team lunch"

### Calendar Queries
- "What meetings do I have this week?"
- "When am I free tomorrow afternoon?"
- "Check if both Alice and Bob are available next Monday at 3pm"
- "List all my recurring events"

## Troubleshooting

1. **Authentication Issues**
   - Ensure `credentials.json` is in the project root
   - Check if OAuth consent screen is configured
   - Verify required scopes are enabled

2. **Server Connection Issues**
   - Verify Node.js version (>= v18.0.0)
   - Check Claude Desktop configuration file
   - Restart Claude Desktop after configuration changes

3. **Event Creation Problems**
   - Confirm calendar permissions
   - Check for time conflicts
   - Verify attendee email addresses

## Notes

- The server automatically checks for time conflicts when creating or updating events
- All times should be specified in RFC3339 format
- Calendar ID 'primary' refers to the user's default calendar
- Event updates maintain existing data for unspecified fields
