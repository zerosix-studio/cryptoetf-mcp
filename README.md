# CryptoETF MCP — spot crypto ETF flows for AI agents

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
      "args": ["-y", "@zerosix-studio/cryptoetf"]
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

MIT licensed.
