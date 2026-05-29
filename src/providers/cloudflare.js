import axios from 'axios';

const CF_API = 'https://api.cloudflare.com/client/v4';

function client(token) {
  return axios.create({
    baseURL: CF_API,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function getZoneId(token, domain) {
  const cf = client(token);
  const res = await cf.get(`/zones?name=${domain}`);
  const zone = res.data.result?.[0];
  if (!zone) throw new Error(`Zone not found for domain: ${domain}. Is it added to Cloudflare?`);
  return zone.id;
}

export async function enableEmailRouting(token, zoneId) {
  const cf = client(token);
  try {
    const res = await cf.post(`/zones/${zoneId}/email/routing/enable`);
    return res.data.result;
  } catch (err) {
    // Already enabled is fine
    if (err.response?.data?.errors?.[0]?.code === 10028) return { status: 'enabled' };
    throw err;
  }
}

export async function getEmailRoutingStatus(token, zoneId) {
  const cf = client(token);
  const res = await cf.get(`/zones/${zoneId}/email/routing`);
  return res.data.result;
}

export async function addDestinationAddress(token, accountId, email) {
  const cf = client(token);
  try {
    const res = await cf.post(`/accounts/${accountId}/email/routing/addresses`, { email });
    return res.data.result;
  } catch (err) {
    if (err.response?.status === 409) return { email, verified: false };
    throw err;
  }
}

export async function createEmailRoute(token, zoneId, { address, domain, forwardTo }) {
  const cf = client(token);
  const res = await cf.post(`/zones/${zoneId}/email/routing/rules`, {
    name: `${address}@${domain}`,
    enabled: true,
    matchers: [{ type: 'literal', field: 'to', value: `${address}@${domain}` }],
    actions: [{ type: 'forward', value: [forwardTo] }],
  });
  return res.data.result;
}

export async function createCatchAllRoute(token, zoneId, forwardTo) {
  const cf = client(token);
  try {
    const res = await cf.put(`/zones/${zoneId}/email/routing/catches`, {
      enabled: true,
      matchers: [{ type: 'all' }],
      actions: [{ type: 'forward', value: [forwardTo] }],
    });
    return res.data.result;
  } catch (err) {
    throw err;
  }
}

export async function listEmailRoutes(token, zoneId) {
  const cf = client(token);
  const res = await cf.get(`/zones/${zoneId}/email/routing/rules`);
  return res.data.result || [];
}

export async function deleteEmailRoute(token, zoneId, ruleId) {
  const cf = client(token);
  const res = await cf.delete(`/zones/${zoneId}/email/routing/rules/${ruleId}`);
  return res.data.result;
}

export async function getAccountId(token) {
  const cf = client(token);
  const res = await cf.get('/accounts');
  return res.data.result?.[0]?.id;
}
