# mailflare ✉️

**Free professional domain email in 5 minutes. No Google Workspace. No monthly fees.**

```bash
npx mailflare setup
```

---

## Why?

Every side project needs `hello@myproject.com`.  
Google Workspace costs **$144+/year** just for that.  
**mailflare** does it for **free**, forever.

---

## How It Works

```
                ┌─────────────────────┐
Incoming email  │                     │  Forward to
─────────────── │  Cloudflare Email   │ ──────────────── your Gmail
root@domain.com │  Routing (free)     │  zymawy@gmail.com
                │                     │
                └─────────────────────┘

                ┌─────────────────────┐
Outgoing email  │                     │  Appears from
─────────────── │  Gmail SMTP or      │ ──────────────── root@domain.com
from Gmail      │  Resend.com (free)  │
                │                     │
                └─────────────────────┘
```

**Two components. Both free.**

| Component | Service | Cost |
|-----------|---------|------|
| Receive emails | Cloudflare Email Routing | Free |
| Send emails | Gmail SMTP | Free |
| Send emails (automated) | Resend.com (3K/month) | Free |

---

## Quick Start

### Option A — Interactive (recommended for first time)
```bash
npx mailflare setup
# Walks you through everything step by step
```

### Option B — Direct with flags
```bash
npx mailflare setup \
  --domain mouthanna.io \
  --address root \
  --forward me@gmail.com
```

### Option C — Fully automated with Resend (zero browser interaction)
```bash
CLOUDFLARE_API_TOKEN=your_cf_token \
RESEND_API_KEY=re_your_key \
npx mailflare setup \
  --domain mouthanna.io \
  --address root \
  --forward me@gmail.com \
  --smtp resend
```

---

## Prerequisites

- **Domain on Cloudflare** — [Add your domain free](https://dash.cloudflare.com)
- **Cloudflare API Token** — [Create one](https://dash.cloudflare.com/profile/api-tokens) with permissions:
  - `Zone.Email Routing` — Edit
  - `Zone.DNS` — Edit
- **Gmail account** (for receive + Gmail SMTP option)
- **OR Resend account** (for fully automated sending) — [Free at resend.com](https://resend.com)

---

## All Commands

```bash
# Set up email for a domain
npx mailflare setup --domain example.com --forward me@gmail.com --address hello

# List all email routes
npx mailflare list --domain example.com

# Send a test email to verify setup
npx mailflare verify --address hello@example.com --to me@gmail.com

# Remove an email route
npx mailflare remove --address hello@example.com
```

---

## Options

### `mailflare setup`

| Flag | Description | Default |
|------|-------------|---------|
| `-d, --domain` | Your domain (e.g. mouthanna.io) | prompted |
| `-a, --address` | Email prefix (e.g. `root` for root@domain) | prompted |
| `-f, --forward` | Gmail/email to forward to | prompted |
| `--smtp` | SMTP provider: `gmail` or `resend` | gmail |
| `--cf-token` | Cloudflare API token | `CLOUDFLARE_API_TOKEN` env |
| `--resend-key` | Resend API key | `RESEND_API_KEY` env |
| `--zone-id` | Cloudflare Zone ID (auto-detected) | auto |

---

## Environment Variables

```bash
# Add to your ~/.zshrc or ~/.bashrc for persistent config
export CLOUDFLARE_API_TOKEN=your_token_here
export RESEND_API_KEY=re_your_key_here
```

Or create a `.env` file in your project:
```env
CLOUDFLARE_API_TOKEN=your_token_here
RESEND_API_KEY=re_your_key_here
```

---

## SMTP Providers Compared

| | Gmail SMTP | Resend.com |
|--|------------|------------|
| Automation | Semi (needs App Password) | ✅ 100% automated |
| Free tier | Unlimited | 3,000 emails/month |
| Setup time | ~5 min (browser steps) | ~1 min |
| Reliability | High | High |
| Best for | Personal use | Projects + APIs |

---

## Comparison vs. Paid Alternatives

| | mailflare | Google Workspace | Zoho Mail | Titan Mail |
|--|-----------|-----------------|-----------|------------|
| **Monthly cost** | **$0** | $6-12/user | $1-4/user | $2-4/user |
| **Annual cost** | **$0** | $72-144+ | $12-48 | $24-48 |
| **Custom domain email** | ✅ | ✅ | ✅ | ✅ |
| **Receive emails** | ✅ | ✅ | ✅ | ✅ |
| **Send from domain** | ✅ | ✅ | ✅ | ✅ |
| **Setup in one command** | ✅ | ❌ | ❌ | ❌ |
| **Open source** | ✅ | ❌ | ❌ | ❌ |

---

## How the Gmail SMTP Setup Works

When you choose Gmail SMTP, mailflare:

1. ✅ Automates everything on Cloudflare (DNS records, forwarding rules)
2. 📋 Prints the exact SMTP settings for Gmail
3. 🔗 Guides you through 4 manual clicks in Gmail settings

The manual steps exist because Google requires browser verification for security.
If you want zero browser interaction, use `--smtp resend`.

---

## Multiple Addresses

Run setup multiple times for different addresses:

```bash
# hello@mouthanna.io
npx mailflare setup --domain mouthanna.io --address hello --forward me@gmail.com

# support@mouthanna.io  
npx mailflare setup --domain mouthanna.io --address support --forward support-team@gmail.com

# *@mouthanna.io (catch-all — coming soon)
npx mailflare setup --domain mouthanna.io --catch-all --forward me@gmail.com
```

---

## Multiple Domains

Works with any domain you have on Cloudflare:

```bash
npx mailflare setup --domain myproject.com --address hello --forward me@gmail.com
npx mailflare setup --domain mysaas.io --address support --forward me@gmail.com
npx mailflare setup --domain freelance.dev --address hamza --forward me@gmail.com
```

---

## Troubleshooting

### "Zone not found for domain"
Your domain isn't in Cloudflare, or your API token doesn't have Zone read access.

### "Authentication error" 
Your Cloudflare API token is missing permissions. Needs: `Zone.Email Routing (edit)` + `Zone.DNS (edit)`.

[Create a token here](https://dash.cloudflare.com/profile/api-tokens) → Custom token → add those two permissions.

### Gmail verification email didn't arrive
Cloudflare forwarding can take 1-5 minutes. Also check spam folder.

### "Route already exists"
You've already set up this email address. Run `mailflare list` to see existing routes.

---

## Local Development

```bash
git clone https://github.com/zymawy/mailflare
cd mailflare
npm install
node bin/mailflare.js setup
```

---

## Contributing

PRs welcome! Key areas:

- [ ] Catch-all routing support
- [ ] ImprovMX provider (for non-Cloudflare domains)
- [ ] Brevo/Sendgrid SMTP backends
- [ ] `mailflare config` command to save tokens
- [ ] Web UI

---

## License

MIT — free for personal and commercial use.

---

## Star History

If mailflare saved you money, give it a ⭐ — it helps others find it.

---

*Built by [Hamza Mohammad](https://mouthanna.io) — Fractional CTO for MENA startups*
