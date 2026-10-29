export interface JinGatewayRequest {
  message: string;
  offlineMode?: boolean;
  passcode?: string;
  onChunk?: (accumulatedText: string, delta: string) => void;
  onRouteChange?: (route: JinGatewayRoute, detail: string) => void;
}

export type JinGatewayRoute = 'stream' | 'sync' | 'local';

export interface JinGatewayResult {
  text: string;
  route: JinGatewayRoute;
  analysisTriggered: boolean;
  targetAvatarState?: string;
  thoughtProcess?: string;
}

const STREAM_FIRST_BYTE_TIMEOUT_MS = 12000;
const STREAM_IDLE_TIMEOUT_MS = 15000;
const SYNC_TIMEOUT_MS = 20000;
const RETRY_DELAY_MS = 450;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function streamOnce(req: JinGatewayRequest): Promise<JinGatewayResult> {
  const controller = new AbortController();
  let timer = setTimeout(() => controller.abort(), STREAM_FIRST_BYTE_TIMEOUT_MS);
  const resetIdle = () => {
    clearTimeout(timer);
    timer = setTimeout(() => controller.abort(), STREAM_IDLE_TIMEOUT_MS);
  };

  try {
    const response = await fetch('/api/jin/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ message: req.message, offlineMode: req.offlineMode, passcode: req.passcode }),
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok || !response.body) throw new Error(`Stream HTTP ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let text = '';
    let analysisTriggered = false;
    let finished = false;

    // SSE events can be split across network chunks, so keep the incomplete tail in a buffer.
    const handleEvent = (rawEvent: string) => {
      const dataLines = rawEvent
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart());
      if (dataLines.length === 0) return;
      try {
        const data = JSON.parse(dataLines.join('\n'));
        if (typeof data.chunk === 'string' && data.chunk) {
          text += data.chunk;
          req.onChunk?.(text, data.chunk);
        }
        if (data.analysisTriggered) analysisTriggered = true;
        if (data.done) finished = true;
      } catch {
        // Malformed event; skip it without dropping the stream.
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      resetIdle();
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        handleEvent(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf('\n\n');
      }
      if (finished) break;
    }
    if (buffer.trim()) handleEvent(buffer);
    reader.cancel().catch(() => {});

    if (!text.trim()) throw new Error('Stream ended without content');
    return { text: text.trim(), route: 'stream', analysisTriggered };
  } finally {
    clearTimeout(timer);
  }
}

async function syncOnce(req: JinGatewayRequest): Promise<JinGatewayResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);
  try {
    const response = await fetch('/api/jin/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: req.message, offlineMode: req.offlineMode, passcode: req.passcode }),
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Sync HTTP ${response.status}`);
    const data = await response.json();
    const reply = typeof data.reply === 'string' ? data.reply.trim() : '';
    if (!reply) throw new Error('Empty reply');
    return {
      text: reply,
      route: 'sync',
      analysisTriggered: !!data.analysisTriggered,
      targetAvatarState: data.targetAvatarState,
      thoughtProcess: data.thoughtProcess,
    };
  } finally {
    clearTimeout(timer);
  }
}

const localReply = (message: string): string =>
  `Mas Joe, koneksi ke server JIN sedang tidak stabil, jadi saya menjawab dari mode lokal. Instruksi "${message.slice(0, 80)}" sudah saya catat. Silakan ulangi sebentar lagi untuk jawaban lengkap.`;

/**
 * Single entry point to the JIN gateway: stream -> retry stream -> sync -> retry sync -> local reply.
 * Never throws, so the UI always gets an answer instead of a gateway error.
 */
export async function sendToJin(req: JinGatewayRequest, preferStreaming = true): Promise<JinGatewayResult> {
  const attempts: { route: JinGatewayRoute; run: () => Promise<JinGatewayResult> }[] = [];
  if (preferStreaming) {
    attempts.push({ route: 'stream', run: () => streamOnce(req) });
    attempts.push({ route: 'stream', run: () => streamOnce(req) });
  }
  attempts.push({ route: 'sync', run: () => syncOnce(req) });
  attempts.push({ route: 'sync', run: () => syncOnce(req) });

  let lastError = '';
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    try {
      if (i > 0) {
        req.onRouteChange?.(attempt.route, `Jalur ${attempt.route} percobaan ${i + 1} (${lastError})`);
        req.onChunk?.('', '');
        await wait(RETRY_DELAY_MS);
      }
      return await attempt.run();
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  req.onRouteChange?.('local', `Semua jalur gateway gagal (${lastError}), memakai balasan lokal`);
  return { text: localReply(req.message), route: 'local', analysisTriggered: false };
}
