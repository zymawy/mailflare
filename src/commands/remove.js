import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { log } from '../utils/logger.js';
import { getToken } from '../utils/config.js';
import { getZoneId, listEmailRoutes, deleteEmailRoute } from '../providers/cloudflare.js';

export async function removeCommand(opts) {
  log.banner();

  const cfToken = getToken(opts);
  if (!cfToken) {
    log.error('Cloudflare API token required. Set CLOUDFLARE_API_TOKEN or use --cf-token');
    process.exit(1);
  }

  let domain = opts.domain;
  let address = opts.address;

  if (!domain || !address) {
    const ans = await inquirer.prompt([
      { name: 'domain', type: 'input', message: 'Domain:', when: !domain, validate: (v) => v.includes('.') },
      { name: 'address', type: 'input', message: 'Email address to remove:', when: !address, validate: (v) => v.includes('@') },
    ]);
    domain = domain || ans.domain;
    address = address || ans.address;
  }

  // Extract domain from address if needed
  if (address.includes('@') && !domain) {
    domain = address.split('@')[1];
  }

  const { confirm } = await inquirer.prompt([{
    name: 'confirm',
    type: 'confirm',
    message: `Remove email route for ${chalk.red(address)}?`,
    default: false,
  }]);

  if (!confirm) { log.info('Cancelled.'); return; }

  const spinner = ora('Removing email route...').start();

  try {
    const zoneId = await getZoneId(cfToken, domain);
    const routes = await listEmailRoutes(cfToken, zoneId);
    const route = routes.find(r => r.matchers?.[0]?.value === address);

    if (!route) {
      spinner.fail(`Route not found for ${address}`);
      log.info(`Run 'mailflare list --domain ${domain}' to see existing routes`);
      return;
    }

    await deleteEmailRoute(cfToken, zoneId, route.id);
    spinner.succeed(`Removed: ${chalk.red(address)}`);

  } catch (err) {
    spinner.fail('Failed to remove route');
    log.error(err.response?.data?.errors?.[0]?.message || err.message);
    process.exit(1);
  }
}
