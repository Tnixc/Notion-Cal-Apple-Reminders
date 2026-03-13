import { getReminders, type AppleReminder } from "./reminders";

interface NativeRequest {
  action: string;
}

interface NativeResponse {
  success: boolean;
  reminders?: AppleReminder[];
  error?: string;
}

function sendMessage(msg: NativeResponse): void {
  const json = JSON.stringify(msg);
  const bytes = new TextEncoder().encode(json);
  const header = new Uint32Array([bytes.length]);
  const headerBytes = new Uint8Array(header.buffer);

  process.stdout.write(Buffer.from(headerBytes));
  process.stdout.write(Buffer.from(bytes));
}

async function readNativeMessage(): Promise<NativeRequest | null> {
  const reader = Bun.stdin.stream().getReader();

  const chunks: Uint8Array[] = [];
  let totalLen = 0;

  while (totalLen < 4) {
    const { value, done } = await reader.read();
    if (done) return null;
    chunks.push(value);
    totalLen += value.length;
  }

  const headerBuf = new Uint8Array(4);
  let offset = 0;
  for (const chunk of chunks) {
    const needed = Math.min(chunk.length, 4 - offset);
    headerBuf.set(chunk.subarray(0, needed), offset);
    offset += needed;
  }

  const msgLen = new DataView(headerBuf.buffer).getUint32(0, true);
  if (msgLen === 0 || msgLen > 1024 * 1024) return null;

  const bodyChunks: Uint8Array[] = [];
  let bodyLen = 0;

  for (const chunk of chunks) {
    if (offset < chunk.length) {
      const leftover = chunk.subarray(offset);
      bodyChunks.push(leftover);
      bodyLen += leftover.length;
    }
    offset = chunk.length;
  }

  while (bodyLen < msgLen) {
    const { value, done } = await reader.read();
    if (done) break;
    bodyChunks.push(value);
    bodyLen += value.length;
  }

  const bodyBuf = new Uint8Array(msgLen);
  let bOffset = 0;
  for (const chunk of bodyChunks) {
    const needed = Math.min(chunk.length, msgLen - bOffset);
    bodyBuf.set(chunk.subarray(0, needed), bOffset);
    bOffset += needed;
  }

  const json = new TextDecoder().decode(bodyBuf);
  return JSON.parse(json);
}

async function main() {
  const message = await readNativeMessage();
  if (!message) {
    sendMessage({ success: false, error: "No message received" });
    return;
  }

  try {
    switch (message.action) {
      case "getReminders": {
        const reminders = getReminders();
        sendMessage({ success: true, reminders });
        break;
      }
      default:
        sendMessage({
          success: false,
          error: `Unknown action: ${message.action}`,
        });
    }
  } catch (e: any) {
    sendMessage({ success: false, error: e.message ?? String(e) });
  }
}

main();
