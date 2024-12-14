import path from 'path'
import os from 'os'
import fs from 'fs'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'),
);
const claudeConfigPath = path.join(
  os.homedir(),
  'Library',
  'Application Support',
  'Claude',
  'claude_desktop_config.json',
)

export function parseArgs() {
  const args = process.argv
  if (args.length !== 3) {
    console.error('Usage: npx *TODO: addcommandhere* init')
    process.exit(1)
  }
  return {
    executablePath: args[1],
    command: args[2],
  }
}

export async function init(executablePath: string) {
  const serverPath = executablePath.includes("build/index.js") ? executablePath : packageJson.name

  const configDir = path.dirname(claudeConfigPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const existingConfig = fs.existsSync(claudeConfigPath) 
    ? JSON.parse(fs.readFileSync(claudeConfigPath, 'utf-8')) 
    : { mcpServers: {} };

  const newConfig = {
    ...existingConfig,
    mcpServers: {
      ...existingConfig.mcpServers,
      google_calendar: {
        command: 'npx',
        args: ['-y', serverPath, 'run'],
      },
    },
  }

  fs.writeFileSync(claudeConfigPath, JSON.stringify(newConfig, null, 2));
}
