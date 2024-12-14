## HOW TO SET UP

1. Clone repo

2. Navigate to project

3. (currently not possible to use this google project, as it is not public) Create a new project in Google Cloud Platform and get credentials

3.5. Create credentials.json file and add to root of project

4. Install dependencies

```bash
npm install
```

5. Build project

```bash
npm run build
```

6. Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google_calendar": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/mcp_server_google_calendar/build/index.js"]
    }
  }
}
```

7. Open Claude Desktop and start talking to your Google Calendar!
