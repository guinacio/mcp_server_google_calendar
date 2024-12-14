export const logs = {
  init: `
╭-------------------------------------------╮
│                                           │
│         Google Calendar MCP init          │
│                                           │
╰-------------------------------------------╯
` as const,
}

export function coolLog(log: typeof logs[keyof typeof logs]) {
  console.log(log)
}
