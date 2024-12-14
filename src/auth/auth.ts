import { promises as fs } from 'fs';
import path from 'path';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { SCOPES } from './scopes.js';
import { Credentials, CredentialsFile } from './schemas.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const TOKEN_PATH = path.resolve(PROJECT_ROOT, 'token.json');
const CREDENTIALS_PATH = path.resolve(PROJECT_ROOT, 'credentials.json');

async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
  try {
    const content = await fs.readFile(TOKEN_PATH, 'utf-8');
    const credentials: Credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials) as OAuth2Client;
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client: OAuth2Client): Promise<void> {
  const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
  const keys: CredentialsFile = JSON.parse(content);
  const key = keys.installed || keys.web;

  if (!key) {
    throw new Error('No valid credentials found');
  }

  const payload: Credentials = {
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token || '',
  };

  await fs.writeFile(TOKEN_PATH, JSON.stringify(payload));
}

export async function authorize(): Promise<OAuth2Client> {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }

  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}
