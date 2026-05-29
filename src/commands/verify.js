import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import nodemailer from 'nodemailer';
import { log } from '../utils/logger.js';
import { getResendKey, loadConfig } from '../utils/config.js';

export async function verifyCommand(opts) {
  log.banner();

  let address = opts.address;
  let to = opts.to;

  if (!address) {
    const ans = await inquirer.prompt([
      {
        name: 'address',
        type: 'input',
        message: 'Email address to test (e.g. root@mouthanna.io):',
        validate: (v) => v.includes('@') || 'Enter a full email address',
      },
      {
        name: 'to',
        type: 'input',
        message: 'Send test to (where to confirm receipt):',
        default: loadConfig().defaultForward || '',
        validate: (v) => v.includes('@') || 'Enter a valid email address',
      },
    ]);
    address = ans.address;
    to = ans.to;
  }

  if (!to) {
    to = loadConfig().defaultForward;
    if (!to) {
      log.error('Please specify --to <email> to receive the test');
      process.exit(1);
    }
  }

  const resendKey = getResendKey(opts);

  if (resendKey) {
    // Use Resend SMTP
    const spinner = ora(`Sending test email from ${address} to ${to}...`).start();
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: { user: 'resend', pass: resendKey },
      });

      await transporter.sendMail({
        from: `Mailflare Test <${address}>`,
        to,
        subject: `✅ mailflare verify: ${address} is working`,
        html: `
          <h2>🎉 Your domain email is working!</h2>
          <p>This confirms:</p>
          <ul>
            <li>✅ <strong>${address}</strong> can send emails</li>
            <li>✅ Forwarding to <strong>${to}</strong> is active</li>
          </ul>
          <p style="color:#888;font-size:12px">Sent by <a href="https://github.com/zymawy/mailflare">mailflare</a></p>
        `,
      });

      spinner.succeed(`Test email sent! Check ${chalk.cyan(to)} for confirmation.`);
    } catch (err) {
      spinner.fail(`Send failed: ${err.message}`);
      log.info('Make sure your Resend API key is valid and the domain is verified in Resend.');
    }
  } else {
    // No SMTP configured — just check receive side with a note
    console.log();
    console.log(chalk.bold(' Verify your email setup:'));
    console.log();
    console.log(` 1. Ask someone to send an email to ${chalk.green(address)}`);
    console.log(`    (or send from another account)`);
    console.log();
    console.log(` 2. Check ${chalk.cyan(to)} — it should arrive within seconds`);
    console.log();
    console.log(` 3. Try replying using ${chalk.green(address)} as the From address`);
    console.log();
    log.info(`To automate this, add a Resend key: mailflare verify --address ${address} --resend-key <key>`);
  }
}
