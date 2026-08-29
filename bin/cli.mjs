#!/usr/bin/env node
/**
 * stdio → Streamable HTTP bridge for the cryptoetf.today MCP server.
 *
 * The server itself lives at https://mcp.cryptoetf.today/api/mcp and speaks
 * HTTP, so clients that support the remote transport (Claude Code, Cursor,
 * VS Code) do not need this package — they connect directly. It exists for
 * clients that only speak stdio: those run `npx @zerosix-studio/cryptoetf`
 * and get the very same server.
 *
 * No dependencies on purpose: `npx` should not pull a package tree just to
 * forward JSON-RPC.
 */

const ENDPOINT =
  process.env.CRYPTOETF_MCP_URL ?? 'https://mcp.cryptoetf.today/api/mcp';

/** Only needed if the endpoint is locked down; the public one works without it. */
const API_KEY = process.env.CRYPTOETF_API_KEY ?? '';

const decoder = new TextDecoder();

function writeOut(line) {
  process.stdout.write(line + '\n');
}

/**
 * A reply arrives either as `application/json` or as an SSE stream where the
 * payload sits in `data:` lines. Notifications are closed with an empty 202,
 * and then there is nothing to write to stdout.
 */
async function readPayloads(response) {
  const type = response.headers.get('content-type') ?? '';
  const body = await response.text();
  if (!body.trim()) return [];

  if (type.includes('text/event-stream')) {
    return body
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .filter(Boolean);
  }
  return [body.trim()];
}

async function forward(line) {
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    // Not our format — drop it silently, the way the stdio transport does.
    return;
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    for (const payload of await readPayloads(response)) {
      writeOut(payload);
    }
  } catch (error) {
    // A notification (no id) must not be answered — the spec expects no reply.
    if (request.id === undefined || request.id === null) return;
    writeOut(
      JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: `cryptoetf-mcp: ${ENDPOINT} unreachable — ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      }),
    );
  }
}

// Requests arrive line by line; the queue preserves their order, otherwise
// replies reach the client interleaved and it loses the id → result mapping.
let queue = Promise.resolve();
let buffer = '';

process.stdin.on('data', (chunk) => {
  buffer += decoder.decode(chunk, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() ?? '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    queue = queue.then(() => forward(trimmed));
  }
});

process.stdin.on('end', () => {
  queue.finally(() => process.exit(0));
});
