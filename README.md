# CryptoETF MCP — spot crypto ETF flows for AI agents

[![npm](https://img.shields.io/npm/v/@zerosix-studio/cryptoetf-mcp?color=cb3837&logo=npm)](https://www.npmjs.com/package/@zerosix-studio/cryptoetf-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@zerosix-studio/cryptoetf-mcp?color=cb3837)](https://www.npmjs.com/package/@zerosix-studio/cryptoetf-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-io.github.sly13%2Fcryptoetf-5b6cff)](https://registry.modelcontextprotocol.io)

The [Model Context Protocol](https://modelcontextprotocol.io) surface of
[cryptoetf.today](https://cryptoetf.today): daily net flows for every US-listed
spot crypto ETF complex, the CEFI sentiment index and live coin prices — for
Claude, Cursor, Codex, Gemini CLI and any other MCP-capable agent.

Thirteen assets: **BTC, ETH, SOL, XRP, HYPE, DOGE, LINK, AVAX, HBAR, LTC, BNB,
DOT, SUI**. Flow figures are net USD millions, sourced from the issuers' own
daily reports; for the eight smaller complexes there is no market-wide
aggregator, so the numbers are computed from each issuer's fund pages.

**You probably don't need to install anything.** The server is hosted, and every
client that speaks remote MCP can reach it directly:

```
https://mcp.cryptoetf.today/api/mcp     Streamable HTTP · JSON-RPC 2.0
```

No API key, no account — the endpoint is open.

## Setup per client

**Claude Code** — one command, no restart:

```bash
claude mcp add --transport http cryptoetf https://mcp.cryptoetf.today/api/mcp
```

**Cursor** — `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "cryptoetf": { "url": "https://mcp.cryptoetf.today/api/mcp" }
  }
}
```

**Claude Desktop and other stdio-only clients** — this package is the bridge.
`claude_desktop_config.json`, then restart the app fully:

```json
{
  "mcpServers": {
    "cryptoetf": {
      "command": "npx",
      "args": ["-y", "@zerosix-studio/cryptoetf-mcp"]
    }
  }
}
```

Nothing to install by hand: `npx` fetches the package on first run. It has zero
dependencies and simply forwards JSON-RPC between stdin/stdout and the hosted
endpoint.

## Tools

| Tool | What it returns |
|---|---|
| `get_flows_summary` | Latest-day net flow for all 13 assets, with the date each figure belongs to |
| `get_asset_flows` | Daily net flow history for one asset over the last 30 days |
| `get_weekly_analytics` | 7-day totals per asset: net flow, average day, positive/negative day counts |
| `get_cefi_index` | Composite CEFI sentiment score (baseline 100; above = bullish) |
| `get_prices` | Spot price and 24h change for every tracked asset |

History reaches back 30 days. Deeper history and per-fund breakdowns live in the
[REST API](https://cryptoetf.today/en/api).

## Ask it things like

- "What are today's crypto ETF flows?"
- "Compare BTC and ETH ETF flows over the past month"
- "Which asset had the strongest week of inflows?"
- "Is the CEFI index bullish right now?"

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `CRYPTOETF_MCP_URL` | `https://mcp.cryptoetf.today/api/mcp` | Point the bridge at another endpoint |
| `CRYPTOETF_API_KEY` | — | Sent as `Authorization: Bearer …` when set; the public endpoint does not need it |

Requires Node.js 18 or newer.

## Data and limits

Flow data is updated every business day as issuers publish. Figures are
informational — this is market data, not investment advice.

- Website: [cryptoetf.today](https://cryptoetf.today)
- REST API and MCP docs: [cryptoetf.today/en/api](https://cryptoetf.today/en/api)

## Privacy Policy

Full policy: [cryptoetf.today/en/privacy](https://cryptoetf.today/en/privacy).

**What is collected.** The bridge forwards your JSON-RPC requests to
`https://mcp.cryptoetf.today/api/mcp` and returns the responses. The only
request data that leaves your machine is the tool name and its arguments (an
asset ticker, at most). Conversation content, files and credentials are never
read or transmitted.

**How it is used and stored.** The server logs the standard request metadata of
any web service — IP address, timestamp, endpoint — and keeps a per-IP counter
in Redis to enforce the 60 requests/minute rate limit. Logs are retained for 30
days and are used only to operate and protect the service.

**Third-party sharing.** None. Request data is not sold, shared or passed to any
third party. The service is operated by us and calls only our own API.

**Retention.** Rate-limit counters expire within a minute; request logs within
30 days. No user accounts and no personal profiles exist — the endpoint is open
and unauthenticated.

**Contact.** [github.com/zerosix-studio/cryptoetf-mcp/issues](https://github.com/zerosix-studio/cryptoetf-mcp/issues)
or the contact form at [cryptoetf.today](https://cryptoetf.today).

## Releasing

Bump the version in `package.json`, then tag the commit:

```bash
git tag v1.0.4 && git push --tags
```

The `Publish to npm` workflow runs the bridge against the live server, skips
the publish if that version is already in the registry, and otherwise pushes it
with provenance — the npm page then links back to the exact workflow run and
commit the tarball was built from.

MIT licensed.
