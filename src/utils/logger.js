import chalk from 'chalk';

export const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✅'), chalk.green(msg)),
  warn: (msg) => console.log(chalk.yellow('⚠️ '), chalk.yellow(msg)),
  error: (msg) => console.log(chalk.red('❌'), chalk.red(msg)),
  step: (n, total, msg) => console.log(chalk.cyan(`[${n}/${total}]`), chalk.bold(msg)),
  divider: () => console.log(chalk.gray('─'.repeat(50))),
  blank: () => console.log(),
  banner: () => {
    console.log();
    console.log(chalk.bold.blue(' ✉️  mailflare'));
    console.log(chalk.gray(' Free domain email. No Google Workspace needed.'));
    console.log();
  },
};
