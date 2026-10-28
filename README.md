# n8n-nodes-dynamoi

**Producing AI music? Promote it free with Dynamoi.**

Free Smart Links, analytics and AI video creatives for every release, on any distributor. Real ad campaigns when you're ready, aimed at the streams that pay royalties.

This is the official [Dynamoi](https://dynamoi.com) community node for [n8n](https://n8n.io). It lets a workflow create Smart Links from Spotify releases and read your artist, audience and campaign results, so new music gets a link and a weekly report without manual work.

[Installation](#installation) · [Credentials](#credentials) · [Operations](#operations) · [Example workflows](#example-workflows) · [Use with an AI agent](#use-with-an-ai-agent) · [Support](#support)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) and install the package `n8n-nodes-dynamoi`.

## Credentials

The node signs in with OAuth2. There is no API key to copy.

1. Add a **Dynamoi OAuth2 API** credential.
2. Select **Connect**. Dynamoi opens in a browser tab.
3. Sign in to your Dynamoi account and approve the connection. n8n shows "Account connected".

n8n registers itself with Dynamoi automatically (OAuth dynamic client registration with PKCE), so there is nothing to configure on either side. You need a Dynamoi account and at least one artist in it. Creating a Smart Link needs access to the artist you choose.

The node calls only the actions listed under [Operations](#operations). It does not launch campaigns, add funds, start checkouts or connect accounts. Campaigns are created in the Dynamoi app, and the node reads them afterwards.

To revoke access, disconnect the credential in n8n or remove the connection in your Dynamoi account settings.

## Operations

| Resource | Operation | What it does |
| --- | --- | --- |
| Smart Link | Create From Spotify Release | Creates a Smart Link from a Spotify album or track URL. Returns the existing link if there is one. |
| Smart Link | Create or Refresh for Spotify Artist | Creates Smart Links for an artist's Spotify catalog and refreshes the existing ones. Returns all of them. |
| Smart Link | Get | Gets one Smart Link. Optionally includes its analytics for a date range. |
| Smart Link | Get Many | Lists an artist's Smart Links, with optional search and published filters. |
| Smart Link | Update Description | Sets or clears the description on a Smart Link. |
| Smart Link | Update Theme | Sets the Smart Link theme for an artist: Aurora, Brutalist, Cinematic or Classic. |
| Artist | Get Many | Lists the artists you can access. |
| Analytics | Get Artist Analytics | Gets clicks and impressions across an artist's campaigns, by day or in total. |
| Analytics | Get Audience Analytics | Gets fans by country and by streaming service for the last 7, 30 or 90 days. |
| Campaign | Get | Gets one campaign, optionally with its analytics. |
| Campaign | Get Many | Lists an artist's campaigns, filtered by type and status. |

Every list operation has **Return All** and **Limit**. Errors from Dynamoi appear as normal n8n node errors, and **Continue On Fail** works as usual.

## Example workflows

Import any of these from [`templates/`](./templates) with **Import from File** in the n8n editor, or paste the JSON onto the canvas.

| Template | What it does |
| --- | --- |
| [Daily new release to Smart Link](./templates/daily-new-release-smart-link.json) | Every morning, creates or refreshes your Smart Links from Spotify and posts the new ones to Discord. |
| [Weekly results digest](./templates/weekly-results-digest.json) | Every Monday, collects Smart Link, campaign and click totals and posts them to Slack, with an optional Google Sheets log. |
| [AI agent with Dynamoi tools](./templates/ai-agent-dynamoi-tools.json) | A chat agent that can find your artists, create Smart Links and answer questions about your results. |

## Use with an AI agent

The node can be used as a tool by n8n's AI Agent. Add it from the agent's **Tool** input as **Dynamoi Tool**, choose a resource and operation, and let the model fill in fields such as the artist and the Spotify URL (use **From AI** next to a field). The agent template above shows a ready-made set.

## Compatibility

Tested with n8n 2.x. The node has no runtime dependencies. It talks to Dynamoi's hosted [MCP server](https://dynamoi.com/docs/mcp-server) at `https://dynamoi.com/mcp`.

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
