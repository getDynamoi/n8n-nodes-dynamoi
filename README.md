# n8n-nodes-dynamoi

**Producing AI music? Promote it free with Dynamoi.**

Free Smart Links, analytics and AI video creatives for every release, on any distributor. Real ad campaigns when you're ready, aimed at the streams that pay royalties.

This is the official [Dynamoi](https://dynamoi.com) community node for [n8n](https://n8n.io). It lets a workflow create Smart Links from Spotify releases and read your artist, audience and campaign results, so new music gets a link and results reach your team without manual work.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Example workflows](#example-workflows) · [Use with an AI agent](#use-with-an-ai-agent) · [Support](#support)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) and install the package `n8n-nodes-dynamoi`.

## Credentials

The node signs in with OAuth2. There is no API key to copy.

1. Add a **Dynamoi OAuth2 API** credential.
2. Select **Connect**. Dynamoi opens in a browser tab.
3. Sign in to your Dynamoi account and approve the connection. n8n shows "Account connected".

n8n registers itself with Dynamoi automatically (OAuth dynamic client registration with PKCE), so there is nothing to configure on either side. You need a Dynamoi account and at least one artist in it.

n8n Cloud and self-hosted instances served over HTTPS or on localhost can connect. Dynamoi rejects plain-HTTP callbacks on other hosts. The consent screen shows "n8n (unverified)" because each n8n instance registers itself; check the redirect address before you approve.

The node connects to Dynamoi's restricted directory endpoint. Access granted there cannot launch campaigns, change budgets or start checkout, and the node only calls the actions listed under [Operations](#operations). Campaigns are created in the Dynamoi app, and the node reads them afterwards. The consent screen may also list distribution items that the node never uses.

The connection stays active for up to seven days of inactivity. If no workflow uses the credential for 7 days, select **Reconnect**.

To revoke access, disconnect the credential in n8n or remove the connection in your Dynamoi account settings.

## Operations

| Resource | Operation | What it does |
| --- | --- | --- |
| Smart Link | Create From Spotify Release | Creates a Smart Link from a Spotify album or track URL. Returns the existing link if there is one. |
| Smart Link | Create or Refresh for Spotify Artist | Creates Smart Links for an artist's Spotify catalog and refreshes the existing ones. Returns all of them. |
| Smart Link | Get | Gets one Smart Link. Optionally includes its analytics for a date range. |
| Smart Link | Get Many | Lists an artist's Smart Links, with optional search and published filters. |
| Smart Link | Update Description | Sets or clears the description on a Smart Link. Changes the public Smart Link page. |
| Artist | Get Many | Lists the artists you can access. |
| Analytics | Get for Artist | Gets clicks and impressions across an artist's campaigns, by day or in total. |
| Analytics | Get Audience | Gets fans by country and by streaming service for the last 7, 30 or 90 days. |
| Campaign | Get | Gets one campaign, optionally with its analytics. |
| Campaign | Get Many | Lists an artist's campaigns, filtered by type and status. |

Every list operation has **Return All** and **Limit**. Errors from Dynamoi appear as normal n8n node errors, and **Continue On Fail** works as usual.

## Example workflows

Import any of these from [`templates/`](./templates) with **Import from File** in the n8n editor, or paste the JSON onto the canvas.

| Template | What it does |
| --- | --- |
| [New Spotify releases to Smart Links](./templates/daily-new-release-smart-link.json) | Every morning, creates or refreshes your Smart Links from Spotify and posts each new one to Discord once. |
| [Daily results digest](./templates/daily-results-digest.json) | Every morning, collects Smart Link, campaign and click totals for the last seven days and posts them to Slack, with an optional Google Sheets log. |
| [AI agent with Dynamoi tools](./templates/ai-agent-dynamoi-tools.json) | A chat agent that can find your artists, create Smart Links and answer questions about your results. |

## Use with an AI agent

The node can be used as a tool by n8n's AI Agent. Add it from the agent's **Tool** input as **Dynamoi Tool**, choose a resource and operation, and let the model fill in fields such as the artist and the Spotify URL (use **From AI** next to a field). Use the Get Many operation of the Artist resource as a tool so the model can find artist IDs. The agent template above shows a ready-made set.

## Compatibility

Tested with n8n 2.x. The node has no runtime dependencies. It talks to Dynamoi's hosted [MCP server](https://dynamoi.com/docs/mcp-server) at `https://dynamoi.com/mcp/directory`. That connection cannot launch campaigns, change budgets or start checkout.

## Support

Questions or problems: [support@dynamoi.com](mailto:support@dynamoi.com) or [open an issue](https://github.com/getDynamoi/n8n-nodes-dynamoi/issues). Dynamoi docs are at [dynamoi.com/docs/mcp-server](https://dynamoi.com/docs/mcp-server).

## Development

```sh
npm ci
npm run lint
npm run build
npm run dev   # starts a local n8n with the node loaded
```

Releases: `npm run release` bumps the version, tags it and pushes. The tag starts the Publish workflow, which publishes to npm with provenance through npm Trusted Publishing.

## License

[MIT](./LICENSE)
