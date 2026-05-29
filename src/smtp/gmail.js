import chalk from 'chalk';
import { createRequire } from 'module';

export function printGmailSmtpGuide({ customEmail, gmailAddress }) {
  console.log(`
${chalk.bold.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
${chalk.bold('📧  Step 2: Set up Gmail to SEND from ' + customEmail)}
${chalk.bold.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}

${chalk.yellow('Before you start, generate a Google App Password:')}

  1. Open: ${chalk.cyan('https://myaccount.google.com/apppasswords')}
  2. Type app name: ${chalk.white('Mailflare SMTP')}
  3. Click ${chalk.white('Create')}
  4. Copy the 16-character password shown

${chalk.yellow('Then add your custom address in Gmail:')}

  1. Open Gmail → Settings (⚙) → ${chalk.white('See all settings')}
  2. Tab: ${chalk.white('Accounts and Import')}
  3. Under "Send mail as" → click ${chalk.white('"Add another email address"')}

  ${chalk.bold('Fill in the popup:')}
  ┌─────────────────────────────────────────────┐
  │ Name:    ${chalk.white('Hamza Mohammad')}                    │
  │ Email:   ${chalk.green(customEmail)}                │
  │ Alias:   ${chalk.white('✅ checked')}                        │
  └─────────────────────────────────────────────┘

  ${chalk.bold('SMTP Settings (Step 2 of popup):')}
  ┌─────────────────────────────────────────────┐
  │ SMTP Server: ${chalk.green('smtp.gmail.com')}                 │
  │ Port:        ${chalk.green('587')}                            │
  │ Username:    ${chalk.green(gmailAddress)}             │
  │ Password:    ${chalk.green('[your 16-char app password]')}    │
  │ Security:    ${chalk.green('TLS ✅')}                         │
  └─────────────────────────────────────────────┘

  Click ${chalk.white('"Add Account"')} → Gmail sends a verification email.

${chalk.yellow('Final step:')}
  Check ${chalk.cyan(gmailAddress)} for a confirmation email
  from ${chalk.white('Gmail Team')} → click the confirm link.

${chalk.bold.green('✅ Done! Compose → click From → select ' + customEmail)}
`);
}

export function printAppPasswordHelp() {
  console.log(`
${chalk.yellow('⚠️  Why App Password?')}

Google requires an App Password (not your regular password) when
adding custom SMTP in Gmail. It only works if you have 2FA enabled.

${chalk.bold('To enable 2FA and get an App Password:')}
  1. ${chalk.cyan('https://myaccount.google.com/two-step-verification')} — enable 2FA
  2. ${chalk.cyan('https://myaccount.google.com/apppasswords')} — create app password
`);
}
