import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { log } from '../utils/logger.js';
import { getToken, getResendKey, saveConfig } from '../utils/config.js';
import {
  getZoneId,
  getAccountId,
  enableEmailRouting,
  getEmailRoutingStatus,
  createEmailRoute,
} from '../providers/cloudflare.js';
import { printGmailSmtpGuide } from '../smtp/gmail.js';
import { validateResendKey, sendTestEmail } from '../smtp/resend.js';

export async function setupCommand(opts) {
  log.banner();

  // ── Gather missing options interactively ──────────────────────────
  const answers = await inquirer.prompt([
    {
      name: 'domain',
      type: 'input',
      message: 'Your domain:',
      default: opts.domain,
      when: !opts.domain,
      validate: (v) => v.includes('.') || 'Enter a valid domain (e.g. mouthanna.io)',
    },
    {
      name: 'address',
      type: 'input',
      message: 'Email prefix (the part before @):',
      default: opts.address || 'hello',
      when: !opts.address,
      validate: (v) => v.length > 0 || 'Enter an email prefix',
    },
    {
      name: 'forward',
      type: 'input',
      message: 'Forward to (your Gmail or personal email):',
      default: opts.forward,
      when: !opts.forward,
      validate: (v) => v.includes('@') || 'Enter a valid email address',
    },
    {
      name: 'smtp',
      type: 'list',
      message: 'SMTP provider (for sending):',
      choices: [
        { name: 'Gmail (guided — free, requires App Password)', value: 'gmail' },
        { name: 'Resend.com (automated — free 3K emails/month)', value: 'resend' },
        { name: 'Skip SMTP setup (receive only)', value: 'skip' },
      ],
      default: opts.smtp || 'gmail',
      when: !opts.smtp || opts.smtp === 'gmail',
    },
    {
      name: 'cfToken',
      type: 'password',
      message: 'Cloudflare API Token:',
      when: () => !getToken(opts),
      validate: (v) => v.length > 10 || 'Enter your Cloudflare API token',
    },
    {
      name: 'resendKey',
      type: 'password',
      message: 'Resend API Key:',
      when: (a) => (a.smtp || opts.smtp) === 'resend' && !getResendKey(opts),
      validate: (v) => v.startsWith('re_') || 'Resend API keys start with re_',
    },
  ]);

  const domain = opts.domain || answers.domain;
  const address = opts.address || answers.address;
  const forward = opts.forward || answers.forward;
  const smtp = answers.smtp || opts.smtp || 'gmail';
  const cfToken = answers.cfToken || getToken(opts);
  const resendKey = answers.resendKey || getResendKey(opts);
  const customEmail = `${address}@${domain}`;

  if (!cfToken) {
    log.error('Cloudflare API token required. Set CLOUDFLARE_API_TOKEN or use --cf-token');
    log.info('Create one at: https://dash.cloudflare.com/profile/api-tokens');
    log.info('Required permissions: Zone.Email Routing (edit), Zone.DNS (edit)');
    process.exit(1);
  }

  log.blank();
  log.divider();
  console.log(chalk.bold(` Setting up: ${chalk.green(customEmail)} → ${chalk.cyan(forward)}`));
  log.divider();
  log.blank();

  // ── Step 1: Cloudflare Email Routing ─────────────────────────────
  log.step(1, smtp === 'skip' ? 2 : 3, 'Configuring Cloudflare Email Routing...');

  const spinner = ora('Connecting to Cloudflare...').start();

  try {
    // Get zone ID
    spinner.text = 'Looking up zone for ' + domain;
    const zoneId = opts.zoneId || await getZoneId(cfToken, domain);

    // Enable Email Routing
    spinner.text = 'Enabling Email Routing...';
    await enableEmailRouting(cfToken, zoneId);

    // Get routing status
    const status = await getEmailRoutingStatus(cfToken, zoneId);
    if (status.status !== 'ready' && status.status !== 'enabled') {
      spinner.warn('Email Routing DNS records may still be propagating');
    }

    // Create forwarding rule
    spinner.text = `Creating rule: ${customEmail} → ${forward}`;
    await createEmailRoute(cfToken, zoneId, { address, domain, forwardTo: forward });

    spinner.succeed(`Email Routing active: ${chalk.green(customEmail)} → ${chalk.cyan(forward)}`);

    // Save token for future use
    saveConfig({ cfToken, domain, defaultForward: forward });

  } catch (err) {
    spinner.fail('Cloudflare setup failed');
    if (err.response?.status === 400 && err.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      log.warn(`Route ${customEmail} already exists — skipping creation`);
    } else {
      log.error(err.response?.data?.errors?.[0]?.message || err.message);
      if (err.response?.status === 403) {
        log.info('Token missing permissions. Needs: Zone.Email Routing (edit) + Zone.DNS (edit)');
      }
      process.exit(1);
    }
  }

  log.blank();

  // ── Step 2: SMTP Setup ────────────────────────────────────────────
  if (smtp === 'resend') {
    log.step(2, 3, 'Configuring Resend SMTP...');

    if (!resendKey) {
      log.error('Resend API key required. Sign up free at: https://resend.com');
      log.info('Use --resend-key or set RESEND_API_KEY env var');
    } else {
      const spinner2 = ora('Validating Resend API key...').start();
      const { valid } = await validateResendKey(resendKey);
      if (valid) {
        spinner2.succeed('Resend API key valid');
        saveConfig({ resendKey });

        // Step 3: Send test email
        log.step(3, 3, 'Sending test email...');
        const spinner3 = ora(`Sending test to ${forward}...`).start();
        try {
          await sendTestEmail({ apiKey: resendKey, from: customEmail, to: forward, domain });
          spinner3.succeed(`Test email sent to ${chalk.cyan(forward)}`);
        } catch (err) {
          spinner3.warn(`Test email failed: ${err.message}`);
          log.info('You may need to verify your domain in Resend dashboard first');
        }
      } else {
        spinner2.fail('Invalid Resend API key');
      }
    }

  } else if (smtp !== 'skip') {
    // Gmail guided setup
    log.step(2, 3, 'Gmail SMTP setup (guided)...');
    printGmailSmtpGuide({ customEmail, gmailAddress: forward });
  }

  // ── Done ──────────────────────────────────────────────────────────
  log.blank();
  log.divider();
  console.log(chalk.bold.green(' 🎉 Setup complete!'));
  log.divider();
  console.log();
  console.log(` ${chalk.bold('Receive:')} Emails to ${chalk.green(customEmail)} land in ${chalk.cyan(forward)}`);
  if (smtp !== 'skip') {
    console.log(` ${chalk.bold('Send:')}    Compose → click From → select ${chalk.green(customEmail)}`);
  }
  console.log();
  console.log(` Run ${chalk.cyan('mailflare verify --address ' + customEmail)} to test.`);
  console.log();
}
