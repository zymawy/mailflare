import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { log } from '../utils/logger.js';
import { getToken, loadConfig } from '../utils/config.js';
import { getZoneId, listEmailRoutes, getEmailRoutingStatus } from '../providers/cloudflare.js';

export async function listCommand(opts) {
  log.banner();

  let domain = opts.domain || loadConfig().domain;
  const cfToken = getToken(opts);

  if (!domain) {
    const ans = await inquirer.prompt([{
      name: 'domain', type: 'input', message: 'Your domain:',
      validate: (v) => v.includes('.') || 'Enter a valid domain',
    }]);
    domain = ans.domain;
  }

  if (!cfToken) {
    log.error('Cloudflare API token required. Set CLOUDFLARE_API_TOKEN or use --cf-token');
    process.exit(1);
  }

  const spinner = ora(`Fetching email routes for ${domain}...`).start();

  try {
    const zoneId = await getZoneId(cfToken, domain);
    const [routes, status] = await Promise.all([
      listEmailRoutes(cfToken, zoneId),
      getEmailRoutingStatus(cfToken, zoneId),
    ]);

    spinner.stop();

    console.log();
    console.log(chalk.bold(` Email routes for ${chalk.cyan(domain)}`));
    console.log(chalk.gray(` Status: ${status.status === 'ready' ? chalk.green('Active') : chalk.yellow(status.status)}`));
    console.log();

    if (routes.length === 0) {
      log.warn('No email routes found. Run: mailflare setup --domain ' + domain);
      return;
    }

    console.log(chalk.bold.gray(' ADDRESS'.padEnd(40) + 'FORWARD TO'.padEnd(35) + 'STATUS'));
    console.log(chalk.gray(' ' + '─'.repeat(85)));

    for (const route of routes) {
      const from = route.matchers?.[0]?.value || '(catch-all)';
      const to = route.actions?.[0]?.value?.join(', ') || '—';
      const active = route.enabled ? chalk.green('✓ active') : chalk.gray('disabled');
      console.log(` ${chalk.green(from.padEnd(39))} ${chalk.cyan(to.padEnd(34))} ${active}`);
    }

    console.log();
    console.log(chalk.gray(` ${routes.length} route(s) total`));
    console.log();

  } catch (err) {
    spinner.fail('Failed to fetch routes');
    log.error(err.response?.data?.errors?.[0]?.message || err.message);
    process.exit(1);
  }
}
