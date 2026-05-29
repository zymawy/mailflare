#!/usr/bin/env node
import { program } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

import { setupCommand } from '../src/commands/setup.js';
import { listCommand } from '../src/commands/list.js';
import { verifyCommand } from '../src/commands/verify.js';
import { removeCommand } from '../src/commands/remove.js';

program
  .name('mailflare')
  .description('Free professional domain email. Cloudflare + Gmail/Resend — no Google Workspace needed.')
  .version(pkg.version);

program
  .command('setup')
  .description('Set up email for your domain')
  .option('-d, --domain <domain>', 'Your domain (e.g. mouthanna.io)')
  .option('-f, --forward <email>', 'Gmail address to forward emails to')
  .option('-a, --address <name>', 'Custom address prefix (e.g. "root" for root@domain.com)')
  .option('--smtp <provider>', 'SMTP provider: gmail or resend (default: gmail)', 'gmail')
  .option('--cf-token <token>', 'Cloudflare API token (or set CLOUDFLARE_API_TOKEN env var)')
  .option('--resend-key <key>', 'Resend API key (or set RESEND_API_KEY env var)')
  .option('--zone-id <id>', 'Cloudflare Zone ID (auto-detected from domain if not provided)')
  .action(setupCommand);

program
  .command('list')
  .description('List all email routes for a domain')
  .option('-d, --domain <domain>', 'Your domain')
  .option('--cf-token <token>', 'Cloudflare API token')
  .action(listCommand);

program
  .command('verify')
  .description('Send a test email to verify your setup works')
  .option('-a, --address <email>', 'Email address to test (e.g. root@mouthanna.io)')
  .option('-t, --to <email>', 'Where to send the test email (defaults to the forwarding address)')
  .action(verifyCommand);

program
  .command('remove')
  .description('Remove an email routing rule')
  .option('-d, --domain <domain>', 'Your domain')
  .option('-a, --address <email>', 'Email address to remove (e.g. root@mouthanna.io)')
  .option('--cf-token <token>', 'Cloudflare API token')
  .action(removeCommand);

program.parse();
