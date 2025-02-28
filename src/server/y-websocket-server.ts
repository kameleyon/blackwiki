#!/usr/bin/env node

/**
 * Y WebSocket Server for real-time collaboration
 * 
 * This server enables real-time collaboration for AfroWiki using Yjs.
 * It handles document synchronization between multiple clients.
 */

import { WebSocket, WebSocketServer } from 'ws';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { setupWSConnection } from 'y-websocket/bin/utils';

const port = process.env.PORT || 1234;
const host = process.env.HOST || 'localhost';

const server = createServer((request: IncomingMessage, response: ServerResponse) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('AfroWiki Y WebSocket Server\n');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (conn: WebSocket, req: IncomingMessage) => {
  setupWSConnection(conn, req, { gc: true });
});

// Convert host to number if it's a port number
const listenHost = !isNaN(Number(host)) ? Number(host) : host;

server.listen(Number(port), typeof listenHost === 'string' ? listenHost : undefined, () => {
  console.log(`Y WebSocket server running at ${host}:${port}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down Y WebSocket server');
  server.close(() => {
    process.exit(0);
  });
});
