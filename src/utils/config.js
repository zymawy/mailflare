import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_PATH = join(homedir(), '.mailflare.json');

export function loadConfig() {
  if (existsSync(CONFIG_PATH)) {
    try { return JSON.parse(readFileSync(CONFIG_PATH, 'utf8')); } catch { return {}; }
  }
  return {};
}

export function saveConfig(data) {
  const existing = loadConfig();
  writeFileSync(CONFIG_PATH, JSON.stringify({ ...existing, ...data }, null, 2));
}

export function getToken(opts) {
  return opts.cfToken || process.env.CLOUDFLARE_API_TOKEN || loadConfig().cfToken;
}

export function getResendKey(opts) {
  return opts.resendKey || process.env.RESEND_API_KEY || loadConfig().resendKey;
}
