import type { Request, Response } from 'express';
import type { Server as IOServer } from 'socket.io';
import { prisma } from '../config/prisma.js';

const clients = new Set<Response>();

export const registerSSE = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);
  const heartbeat = setInterval(() => res.write(`event: heartbeat\ndata: ${Date.now()}\n\n`), 25000);

  clients.add(res);
  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
};

export const pushActiveRunsUpdate = async (io: IOServer) => {
  const activeRuns = await prisma.workflowRun.findMany({ where: { status: 'in_progress' }, include: { repository: true } });
  const payload = JSON.stringify(activeRuns);
  for (const client of clients) client.write(`event: active-runs\ndata: ${payload}\n\n`);
  io.emit('active-runs:updated', activeRuns);
};
