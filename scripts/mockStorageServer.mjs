#!/usr/bin/env node
/**
 * mockStorageServer.mjs — n8n file/image webhook 로컬 스텁
 * 로컬 프로파일 경로:
 *   POST /local-disabled/webhook/upload-file
 *   POST /local-disabled/webhook/upload
 *   GET  /local-disabled/files/:id
 *   GET  /local-disabled/images/:id
 */
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PORT = Number(process.env.MOCK_STORAGE_PORT || 9999);
const ROOT = process.env.MOCK_STORAGE_DIR || '/tmp/okdohyuk-mock-storage';
mkdirSync(ROOT, { recursive: true });

const parseBoundary = (contentType = '') => {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  return match?.[1] || match?.[2] || '';
};

const parseMultipartFile = (buffer, contentType) => {
  const boundary = parseBoundary(contentType);
  if (!boundary) return null;
  const marker = Buffer.from(`--${boundary}`);
  let start = buffer.indexOf(marker);
  while (start !== -1) {
    const headerStart = start + marker.length + 2;
    const headerEnd = buffer.indexOf(Buffer.from('\r\n\r\n'), headerStart);
    if (headerEnd === -1) break;
    const headers = buffer.slice(headerStart, headerEnd).toString('utf8');
    const next = buffer.indexOf(marker, headerEnd);
    if (next === -1) break;
    if (/name="file"/i.test(headers)) {
      let body = buffer.slice(headerEnd + 4, next);
      if (body.length >= 2 && body[body.length - 2] === 13 && body[body.length - 1] === 10) {
        body = body.subarray(0, body.length - 2);
      }
      const filename = /filename="([^"]+)"/i.exec(headers)?.[1] || 'file';
      const mime = /content-type:\s*([^\r\n]+)/i.exec(headers)?.[1]?.trim() || 'application/octet-stream';
      return { filename, mime, body };
    }
    start = next;
  }
  return null;
};

const send = (res, status, body, headers = {}) => {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, headers);
  res.end(payload);
};

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  };
  if (req.method === 'OPTIONS') {
    send(res, 204, '', cors);
    return;
  }

  const isUpload =
    req.method === 'POST' &&
    (url.pathname === '/local-disabled/webhook/upload-file' ||
      url.pathname === '/local-disabled/webhook/upload' ||
      url.pathname === '/webhook/upload-file' ||
      url.pathname === '/webhook/upload');

  if (isUpload) {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const parsed = parseMultipartFile(buffer, req.headers['content-type'] || '');
      if (!parsed) {
        send(res, 400, { status: 400, error: 'file field missing' }, { ...cors, 'Content-Type': 'application/json' });
        return;
      }
      const id = randomUUID();
      writeFileSync(join(ROOT, `${id}.bin`), parsed.body);
      writeFileSync(
        join(ROOT, `${id}.json`),
        JSON.stringify({ originalFilename: parsed.filename, mimeType: parsed.mime, fileSize: parsed.body.length }),
      );
      send(res, 200, { status: 'success', url: id }, { ...cors, 'Content-Type': 'application/json' });
    });
    return;
  }

  const fileMatch = url.pathname.match(/^\/local-disabled\/(files|images)\/([^/]+)$/);
  if (req.method === 'GET' && fileMatch) {
    const id = fileMatch[2];
    const binPath = join(ROOT, `${id}.bin`);
    const metaPath = join(ROOT, `${id}.json`);
    if (!existsSync(binPath)) {
      send(res, 404, { status: 404, error: 'File not found' }, { ...cors, 'Content-Type': 'application/json' });
      return;
    }
    const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, 'utf8')) : {};
    send(res, 200, readFileSync(binPath), {
      ...cors,
      'Content-Type': meta.mimeType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=60',
    });
    return;
  }

  send(res, 404, { status: 404, error: 'not found' }, { ...cors, 'Content-Type': 'application/json' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[mock-storage] http://127.0.0.1:${PORT} dir=${ROOT}`);
});
